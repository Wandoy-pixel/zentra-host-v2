# Setup Bisnis Real Zentra Host

Panduan lengkap untuk mengaktifkan fitur bisnis (payment gateway, email otomatis, admin panel) di Zentra Host. Ikuti urutan langkah-langkah di bawah ini ya!

---

## Langkah 1: Jalankan SQL Tabel Baru

- [ ] Buka [Supabase Dashboard](https://supabase.com/dashboard) → pilih project kamu
- [ ] Masuk ke menu **SQL Editor** (icon di sidebar kiri)
- [ ] Klik **New Query**
- [ ] Buka file `C:/Users/user25/Desktop/SUPABASE-BUSINESS-TABLES.sql` di komputer kamu
- [ ] Copy-paste seluruh isinya ke SQL Editor
- [ ] Klik **Run** (atau tekan `Ctrl+Enter`)
- [ ] Pastikan ada notif "Success. No rows returned"

> Tabel baru yang dibuat: `orders`, `payments`, `email_logs`, dll.

---

## Langkah 2: Setup Midtrans (Payment Gateway)

Midtrans dipakai buat terima pembayaran (QRIS, GoPay, Bank Transfer, Kartu Kredit, dll).

- [ ] Daftar akun di [https://midtrans.com](https://midtrans.com) — **gratis, ga ada biaya bulanan**
- [ ] Login ke dashboard Midtrans
- [ ] Pastikan posisi **Sandbox** (toggle kiri atas) — buat testing dulu
- [ ] Buka **Settings** → **Access Keys**
- [ ] Copy 2 keys ini:
  - `Server Key` (format: `SB-Mid-server-xxxxx`)
  - `Client Key` (format: `SB-Mid-client-xxxxx`)
- [ ] Buka **Settings** → **Configuration** → **Payment Notification URL**
- [ ] Set webhook URL ke: `https://zentra-host-v2.vercel.app/api/midtrans/webhook`
- [ ] Save

### Add Env Vars di Vercel

- [ ] Buka [Vercel Dashboard](https://vercel.com/dashboard) → project `zentra-host-v2`
- [ ] Settings → **Environment Variables**
- [ ] Tambah 3 variables ini (scope: Production, Preview, Development):

```
MIDTRANS_SERVER_KEY              = SB-Mid-server-xxxxx (server key kamu)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY  = SB-Mid-client-xxxxx (client key kamu)
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION = false
```

- [ ] **Redeploy** project (Deployments → klik `...` di deployment terakhir → Redeploy)

---

## Langkah 3: Setup Resend (Email)

Resend dipakai buat kirim email invoice, notif order, reset password, dll.

- [ ] Daftar akun di [https://resend.com](https://resend.com) — **gratis 100 email/hari, 3000/bulan**
- [ ] Verify email kamu
- [ ] (Opsional) Verify domain kamu di **Domains** → **Add Domain**
  - Kalau belum punya domain, skip aja → pakai default `onboarding@resend.dev` buat testing
- [ ] Buka **API Keys** → **Create API Key**
  - Name: `zentra-host-production`
  - Permission: `Full access`
- [ ] Copy API key (format: `re_xxxxx`) — **simpan baik-baik, ga bisa dilihat lagi!**

### Add Env Vars di Vercel

- [ ] Balik ke Vercel → Environment Variables
- [ ] Tambah:

```
RESEND_API_KEY     = re_xxxxx (api key kamu)
RESEND_FROM_EMAIL  = Zentra Host <onboarding@resend.dev>
```

> Kalau udah verify domain sendiri, ganti ke: `Zentra Host <noreply@zentra.id>`

- [ ] **Redeploy** lagi

---

## Langkah 4: Setup Supabase Service Role

Service Role Key dibutuhkan supaya webhook Midtrans bisa update database tanpa kena RLS (Row Level Security).

- [ ] Buka [Supabase Dashboard](https://supabase.com/dashboard) → project kamu
- [ ] Settings → **API**
- [ ] Scroll ke bagian **Project API keys**
- [ ] Copy key di baris **`service_role`** (yang `secret`)

> **PENTING BANGET:** Key ini RAHASIA. Jangan pernah:
> - Commit ke Git
> - Share di chat/email
> - Pakai di kode frontend (browser)
>
> Kalau bocor → langsung **Reset** di dashboard Supabase.

### Add Env Var di Vercel

- [ ] Tambah:

```
SUPABASE_SERVICE_ROLE_KEY = eyJxxx... (service role key kamu)
```

- [ ] **Redeploy**

---

## Langkah 5: Set Diri Sebagai Admin

Biar kamu bisa akses dashboard admin (`/admin`), role di database harus di-set ke `admin`.

- [ ] Buka Supabase → **SQL Editor** → **New Query**
- [ ] Paste SQL ini (ganti `email_anda@gmail.com` dengan email login kamu):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email_anda@gmail.com'
);
```

- [ ] Klik **Run**
- [ ] Logout & login ulang di Zentra Host → akses `/admin` harusnya udah bisa

---

## Langkah 6: Switch ke Production

Setelah test sandbox lancar dan siap terima uang beneran:

- [ ] **Midtrans:** Verify business (KYC) — upload KTP, NPWP, rekening bank
  - Buka dashboard Midtrans → **Settings** → **Merchant Information**
  - Tunggu approval 1-3 hari kerja
- [ ] Switch toggle Midtrans dari **Sandbox** ke **Production**
- [ ] Copy **Production** Server Key & Client Key (beda sama sandbox!)
- [ ] Update env vars di Vercel:

```
MIDTRANS_SERVER_KEY                 = Mid-server-xxxxx (PRODUCTION)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY     = Mid-client-xxxxx (PRODUCTION)
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION  = true
```

- [ ] Update webhook URL Midtrans production ke domain yang sama
- [ ] **Resend:** Verify domain sendiri (biar email pengirim pakai `@zentra.id`, bukan `@resend.dev`)
  - Lebih trusted, less masuk spam
- [ ] **Redeploy** final

---

## Modal Awal Bisnis (Realistic)

Berikut perkiraan biaya operasional bulan pertama:

| Service        | Free Tier                           | Paid (kalau growing)         |
| -------------- | ----------------------------------- | ---------------------------- |
| Midtrans       | Gratis sign up, no monthly fee      | Fee per transaksi 2-3%       |
| Resend         | 100 email/hari, 3000/bulan          | $20/bulan untuk 50k email    |
| Supabase       | 500MB DB, 1GB storage               | $25/bulan untuk Pro          |
| Vercel         | Hobby (100GB bandwidth)             | $20/bulan untuk Pro          |
| Domain custom  | -                                   | ~Rp 150rb/tahun (.id)        |

### Total Biaya Bulan Pertama: **Rp 0 - Rp 200rb**

- Kalau masih testing & traffic kecil → semua free tier cukup
- Modal cuma kalau mau beli domain custom (`.id`, `.com`, dll)
- Fee Midtrans 2-3% itu dipotong dari transaksi, **bukan biaya bulanan**

---

## Troubleshooting

### Webhook Midtrans ga jalan?
- Cek webhook URL di Midtrans dashboard udah bener
- Cek logs di Vercel → Functions → `/api/midtrans/webhook`
- Pastikan `SUPABASE_SERVICE_ROLE_KEY` udah di-set

### Email ga terkirim?
- Cek dashboard Resend → **Emails** tab → ada error message?
- Domain verified? Kalau belum → harus pakai `onboarding@resend.dev`
- Cek `RESEND_API_KEY` di Vercel

### Bisa daftar tapi ga bisa akses /admin?
- Pastikan udah jalanin SQL set role admin (Langkah 5)
- Logout dulu, baru login ulang

---

## Selesai!

Sekarang Zentra Host kamu udah siap terima order beneran. Selamat berjualan!

Kalau ada error atau bingung, screenshot error-nya dan tanya ke developer (atau ke Claude).
