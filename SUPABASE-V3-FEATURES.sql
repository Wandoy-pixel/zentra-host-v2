-- =====================================================
-- ZENTRA HOST V3 - PREMIUM FEATURES SCHEMA
-- =====================================================
-- Idempotent migration: aman di-run ulang.
-- Berisi: promo_codes, affiliates, referrals,
--        loyalty_points, user_settings, knowledge_base
-- =====================================================

-- =====================================================
-- 1. PROMO CODES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    min_amount INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_until ON public.promo_codes(valid_until);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_codes_public_select" ON public.promo_codes;
CREATE POLICY "promo_codes_public_select"
    ON public.promo_codes FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "promo_codes_admin_insert" ON public.promo_codes;
CREATE POLICY "promo_codes_admin_insert"
    ON public.promo_codes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "promo_codes_admin_update" ON public.promo_codes;
CREATE POLICY "promo_codes_admin_update"
    ON public.promo_codes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "promo_codes_admin_delete" ON public.promo_codes;
CREATE POLICY "promo_codes_admin_delete"
    ON public.promo_codes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Sample promo codes (idempotent via ON CONFLICT)
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses, valid_until, min_amount, active)
VALUES
    ('WELCOME50', 'percentage', 50, 100, NOW() + INTERVAL '90 days', 0, TRUE),
    ('HEMAT100', 'fixed', 100000, 50, NOW() + INTERVAL '60 days', 200000, TRUE),
    ('NEWUSER', 'percentage', 30, NULL, NULL, 0, TRUE)
ON CONFLICT (code) DO NOTHING;


-- =====================================================
-- 2. AFFILIATES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.affiliates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate INTEGER NOT NULL DEFAULT 30,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);

-- Function: auto-generate referral code WANDOY-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'WANDOY-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE referral_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-set referral_code on INSERT jika kosong
CREATE OR REPLACE FUNCTION public.set_affiliate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_affiliate_referral_code ON public.affiliates;
CREATE TRIGGER trg_affiliate_referral_code
    BEFORE INSERT ON public.affiliates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_affiliate_referral_code();

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliates_user_select_own" ON public.affiliates;
CREATE POLICY "affiliates_user_select_own"
    ON public.affiliates FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "affiliates_user_insert_own" ON public.affiliates;
CREATE POLICY "affiliates_user_insert_own"
    ON public.affiliates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "affiliates_admin_update" ON public.affiliates;
CREATE POLICY "affiliates_admin_update"
    ON public.affiliates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );


-- =====================================================
-- 3. REFERRALS (track referral relationships)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id BIGSERIAL PRIMARY KEY,
    affiliate_id BIGINT REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    commission_amount INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_order_id ON public.referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_affiliate_select_own" ON public.referrals;
CREATE POLICY "referrals_affiliate_select_own"
    ON public.referrals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.affiliates
            WHERE affiliates.id = referrals.affiliate_id
              AND affiliates.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "referrals_admin_insert" ON public.referrals;
CREATE POLICY "referrals_admin_insert"
    ON public.referrals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "referrals_admin_update" ON public.referrals;
CREATE POLICY "referrals_admin_update"
    ON public.referrals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );


-- =====================================================
-- 4. LOYALTY POINTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('purchase', 'redeem', 'bonus')),
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_order_id ON public.loyalty_points(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created_at ON public.loyalty_points(created_at DESC);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_points_user_select_own" ON public.loyalty_points;
CREATE POLICY "loyalty_points_user_select_own"
    ON public.loyalty_points FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "loyalty_points_admin_insert" ON public.loyalty_points;
CREATE POLICY "loyalty_points_admin_insert"
    ON public.loyalty_points FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );


-- =====================================================
-- 5. USER SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sound_effects BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_currency TEXT NOT NULL DEFAULT 'IDR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_settings_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_user_select_own" ON public.user_settings;
CREATE POLICY "user_settings_user_select_own"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_user_insert_own" ON public.user_settings;
CREATE POLICY "user_settings_user_insert_own"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_settings_user_update_own" ON public.user_settings;
CREATE POLICY "user_settings_user_update_own"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- 6. KNOWLEDGE BASE (Help Articles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('getting-started', 'billing', 'hosting', 'domain', 'security')),
    content TEXT NOT NULL,
    views_count INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_slug ON public.knowledge_base(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_published ON public.knowledge_base(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_views_count ON public.knowledge_base(views_count DESC);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_base_public_select" ON public.knowledge_base;
CREATE POLICY "knowledge_base_public_select"
    ON public.knowledge_base FOR SELECT
    USING (
        published = TRUE
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "knowledge_base_admin_insert" ON public.knowledge_base;
CREATE POLICY "knowledge_base_admin_insert"
    ON public.knowledge_base FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "knowledge_base_admin_update" ON public.knowledge_base;
CREATE POLICY "knowledge_base_admin_update"
    ON public.knowledge_base FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "knowledge_base_admin_delete" ON public.knowledge_base;
CREATE POLICY "knowledge_base_admin_delete"
    ON public.knowledge_base FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Sample knowledge base articles
INSERT INTO public.knowledge_base (slug, title, category, content, published)
VALUES
    (
        'cara-setup-wordpress',
        'Cara Setup WordPress di Zentra Host',
        'getting-started',
        E'# Cara Setup WordPress\n\nIkuti langkah berikut untuk install WordPress:\n\n1. Login ke dashboard Zentra Host\n2. Pilih menu **Hosting** > pilih paket aktif\n3. Klik tombol **Install WordPress** (1-click installer)\n4. Isi nama situs, username admin, dan password\n5. Tunggu 1-2 menit hingga proses selesai\n6. Akses situs di domain Anda dan login ke `/wp-admin`\n\n## Tips\n- Gunakan password yang kuat (min. 12 karakter)\n- Aktifkan SSL gratis dari menu Security\n- Install plugin cache seperti LiteSpeed Cache untuk performa maksimal',
        TRUE
    ),
    (
        'setup-email-custom-domain',
        'Setup Email Custom dengan Domain Sendiri',
        'getting-started',
        E'# Setup Email Custom Domain\n\nBuat email `nama@domainanda.com` dalam 5 menit:\n\n1. Masuk dashboard > menu **Email**\n2. Klik **Buat Email Baru**\n3. Isi alamat email dan password\n4. Tentukan kuota mailbox (default 1 GB)\n5. Setting MX record otomatis akan tertambah\n\n## Konfigurasi Client (Outlook/Gmail)\n- IMAP: `mail.domainanda.com` port 993 (SSL)\n- SMTP: `mail.domainanda.com` port 465 (SSL)\n- Username: alamat email lengkap\n- Password: yang Anda set\n\n## Webmail\nAkses langsung di `https://webmail.domainanda.com`',
        TRUE
    ),
    (
        'apa-itu-ssl',
        'Apa Itu SSL dan Kenapa Penting?',
        'security',
        E'# Apa Itu SSL?\n\nSSL (Secure Sockets Layer) adalah teknologi enkripsi yang mengamankan data antara browser pengunjung dan server website Anda. Tanda kalau SSL aktif: alamat web pakai **HTTPS** dan ada ikon gembok.\n\n## Manfaat SSL\n- **Keamanan data**: password dan transaksi terenkripsi\n- **SEO booster**: Google prioritaskan situs HTTPS\n- **Trust**: pengunjung lebih percaya\n- **Wajib** untuk e-commerce dan login form\n\n## Cara Aktifkan SSL Gratis\nSemua paket Zentra Host sudah include **Lets Encrypt SSL gratis**:\n1. Buka dashboard > menu **Security**\n2. Klik **Aktifkan SSL**\n3. Pilih domain > submit\n4. Tunggu 2-5 menit hingga issued\n\nSSL akan auto-renew setiap 90 hari, tidak perlu maintenance manual.',
        TRUE
    ),
    (
        'cara-backup-website',
        'Cara Backup Website dan Database',
        'hosting',
        E'# Cara Backup Website\n\nBackup rutin = tidur nyenyak. Berikut cara backup di Zentra Host:\n\n## Backup Otomatis\nSemua paket include backup harian otomatis (retensi 7 hari).\n- Lokasi: dashboard > **Backup** > **Auto Backup**\n- Restore tinggal klik tombol **Restore**\n\n## Backup Manual\n1. Dashboard > **Backup** > **Create New Backup**\n2. Pilih: Files saja / Database saja / Full backup\n3. Tunggu proses (1-10 menit tergantung ukuran)\n4. Download `.tar.gz` atau pulihkan langsung\n\n## Best Practice\n- Backup manual sebelum update plugin/tema besar\n- Simpan minimal 1 backup di local/cloud Anda\n- Test restore minimal 1x per bulan',
        TRUE
    ),
    (
        'metode-pembayaran-tagihan',
        'Metode Pembayaran dan Tagihan',
        'billing',
        E'# Metode Pembayaran\n\nZentra Host menerima berbagai metode pembayaran:\n\n## Pembayaran Digital\n- **E-Wallet**: GoPay, OVO, DANA, ShopeePay, LinkAja\n- **Virtual Account**: BCA, BNI, BRI, Mandiri, Permata\n- **QRIS**: scan dari semua aplikasi e-wallet\n- **Kartu Kredit**: Visa, Mastercard, JCB\n\n## Cicilan 0%\nTersedia untuk paket tahunan minimal Rp 500.000 lewat kartu kredit BCA dan Mandiri (3, 6, atau 12 bulan).\n\n## Tagihan & Invoice\n- Invoice dikirim ke email H-7 sebelum jatuh tempo\n- Auto-renewal tersedia jika kartu/e-wallet sudah tersimpan\n- Download invoice lewat dashboard > **Billing** > **Invoices**',
        TRUE
    ),
    (
        'transfer-domain-ke-zentra',
        'Cara Transfer Domain ke Zentra Host',
        'domain',
        E'# Transfer Domain ke Zentra Host\n\nPindahkan pengelolaan domain dari registrar lain dengan mudah:\n\n## Syarat Transfer\n1. Domain berusia minimal **60 hari** sejak registrasi/transfer terakhir\n2. Status domain di registrar lama harus **Unlocked**\n3. Privacy/WHOIS protection **dimatikan sementara**\n4. Punya **EPP/Auth Code** dari registrar lama\n\n## Langkah Transfer\n1. Dashboard > **Domain** > **Transfer Domain**\n2. Masukkan nama domain\n3. Paste EPP/Auth Code\n4. Bayar biaya transfer (sudah include 1 tahun perpanjangan)\n5. Konfirmasi email dari registrar lama (cek inbox & spam)\n6. Tunggu 5-7 hari untuk proses selesai\n\nSelama transfer, domain dan website tetap aktif normal.',
        TRUE
    )
ON CONFLICT (slug) DO NOTHING;


-- =====================================================
-- RELOAD POSTGREST SCHEMA CACHE
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
