/**
 * Email HTML Templates — Zentra Host
 * Semua template return HTML string, inline CSS only (email-safe),
 * tabel layout, max 600px, responsive.
 */

const BRAND = {
  name: 'Zentra Host',
  url: 'https://zentra.id',
  supportEmail: 'support@zentra.id',
  privacyUrl: 'https://zentra.id/privacy',
  termsUrl: 'https://zentra.id/terms',
  unsubUrl: 'https://zentra.id/unsubscribe',
};

// ---------- Shared building blocks ----------

function baseLayout(opts: { title: string; preheader?: string; body: string }): string {
  const preheader = opts.preheader || '';
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${escapeHtml(opts.title)}</title>
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .h1 { font-size: 22px !important; }
    .btn { display: block !important; width: 100% !important; box-sizing: border-box; }
  }
  body { margin: 0; padding: 0; background: #f3f4f6; }
</style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          ${headerBlock()}
          ${opts.body}
          ${footerBlock()}
        </table>
        <table role="presentation" width="600" class="container" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
          <tr>
            <td align="center" style="padding:16px 12px;color:#9ca3af;font-size:12px;line-height:1.6;">
              &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function headerBlock(): string {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#14b8a6 0%,#6366f1 100%);padding:28px 32px;" class="px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#ffffff;width:44px;height:44px;border-radius:10px;text-align:center;vertical-align:middle;font-size:22px;font-weight:800;color:#0d9488;font-family:Arial,sans-serif;">Z</td>
                <td style="padding-left:14px;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">${BRAND.name}</td>
              </tr>
            </table>
          </td>
          <td align="right" style="color:#e0e7ff;font-size:12px;vertical-align:middle;">Hosting Indonesia</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function footerBlock(): string {
  return `
  <tr>
    <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;" class="px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="color:#6b7280;font-size:13px;line-height:1.6;">
            Butuh bantuan? Hubungi <a href="mailto:${BRAND.supportEmail}" style="color:#6366f1;text-decoration:none;">${BRAND.supportEmail}</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:12px;color:#9ca3af;font-size:12px;">
            <a href="${BRAND.privacyUrl}" style="color:#9ca3af;text-decoration:underline;margin:0 8px;">Privacy</a>
            &middot;
            <a href="${BRAND.termsUrl}" style="color:#9ca3af;text-decoration:underline;margin:0 8px;">Terms</a>
            &middot;
            <a href="${BRAND.unsubUrl}" style="color:#9ca3af;text-decoration:underline;margin:0 8px;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#14b8a6 0%,#6366f1 100%);">
        <a href="${url}" class="btn" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;font-family:Arial,sans-serif;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rupiah(n: number): string {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

// ---------- Public templates ----------

export function welcomeEmail(name: string): string {
  const safeName = escapeHtml(name || 'Sobat Zentra');
  const body = `
  <tr>
    <td class="px" style="padding:36px 32px 8px 32px;">
      <h1 class="h1" style="margin:0 0 12px 0;font-size:26px;color:#111827;font-weight:700;line-height:1.3;">Selamat datang, ${safeName}!</h1>
      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        Akun ${BRAND.name} kamu sudah aktif. Saatnya mulai bangun web impianmu —
        kelola hosting, domain, database, dan email dari satu dashboard yang simple.
      </p>
      <p style="margin:0 0 8px 0;color:#374151;font-size:15px;line-height:1.7;">
        Klik tombol di bawah untuk masuk ke dashboard:
      </p>
      ${ctaButton('Masuk ke Dashboard', `${BRAND.url}/login`)}
      <p style="margin:8px 0 24px 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Tips: Lengkapi profil & aktifkan 2FA biar akunmu lebih aman.
      </p>
    </td>
  </tr>`;
  return baseLayout({
    title: `Selamat datang di ${BRAND.name}`,
    preheader: `Halo ${name}, akun kamu sudah aktif. Yuk masuk ke dashboard!`,
    body,
  });
}

export type InvoiceItem = {
  name: string;
  qty?: number;
  price: number;
};

export function invoiceEmail(
  name: string,
  invoiceNo: string,
  items: InvoiceItem[],
  total: number,
  payLink?: string
): string {
  const safeName = escapeHtml(name || 'Customer');
  const safeInv = escapeHtml(invoiceNo);

  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">${escapeHtml(it.name)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;text-align:center;">${it.qty || 1}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;">${rupiah(it.price)}</td>
      </tr>`
    )
    .join('');

  const pay = payLink || `${BRAND.url}/pay/${encodeURIComponent(invoiceNo)}`;

  const body = `
  <tr>
    <td class="px" style="padding:36px 32px 8px 32px;">
      <h1 class="h1" style="margin:0 0 8px 0;font-size:24px;color:#111827;font-weight:700;">Invoice ${safeInv}</h1>
      <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo ${safeName}, berikut rincian pesananmu di ${BRAND.name}.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <tr style="background:#f9fafb;">
          <td style="padding:12px 8px;color:#374151;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Item</td>
          <td style="padding:12px 8px;color:#374151;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</td>
          <td style="padding:12px 8px;color:#374151;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Harga</td>
        </tr>
        ${rows}
        <tr>
          <td colspan="2" style="padding:14px 8px;background:#f9fafb;color:#111827;font-size:15px;font-weight:700;">TOTAL</td>
          <td style="padding:14px 8px;background:#f9fafb;color:#0d9488;font-size:16px;font-weight:700;text-align:right;">${rupiah(total)}</td>
        </tr>
      </table>

      <h3 style="margin:24px 0 8px 0;font-size:16px;color:#111827;">Cara Bayar</h3>
      <ol style="margin:0 0 16px 18px;padding:0;color:#374151;font-size:14px;line-height:1.7;">
        <li>Klik tombol "Bayar Sekarang" di bawah.</li>
        <li>Pilih metode pembayaran (Bank Transfer / E-Wallet / QRIS).</li>
        <li>Selesaikan pembayaran sesuai instruksi.</li>
        <li>Layananmu otomatis aktif setelah pembayaran terkonfirmasi.</li>
      </ol>
      ${ctaButton('Bayar Sekarang', pay)}
      <p style="margin:8px 0 24px 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Link pembayaran berlaku 24 jam. Simpan invoice ini untuk referensi.
      </p>
    </td>
  </tr>`;

  return baseLayout({
    title: `Invoice ${invoiceNo} - ${BRAND.name}`,
    preheader: `Invoice ${invoiceNo} total ${rupiah(total)} — selesaikan pembayaran.`,
    body,
  });
}

export type ActivationCredentials = {
  username?: string;
  password?: string;
  host?: string;
  port?: string | number;
  cpanelUrl?: string;
  ipAddress?: string;
  [key: string]: string | number | undefined;
};

export function activationEmail(
  name: string,
  service: string,
  credentials: ActivationCredentials
): string {
  const safeName = escapeHtml(name || 'Customer');
  const safeService = escapeHtml(service);

  const credRows = Object.entries(credentials)
    .filter(([k, v]) => v != null && v !== '' && k !== 'cpanelUrl')
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;text-transform:capitalize;width:35%;">${escapeHtml(k)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-family:'Courier New',monospace;">${escapeHtml(String(v))}</td>
      </tr>`
    )
    .join('');

  const cpanel = credentials.cpanelUrl;

  const body = `
  <tr>
    <td class="px" style="padding:36px 32px 8px 32px;">
      <h1 class="h1" style="margin:0 0 8px 0;font-size:24px;color:#111827;font-weight:700;">Layananmu aktif!</h1>
      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo ${safeName}, layanan <strong>${safeService}</strong> sudah berhasil di-provision dan siap digunakan.
      </p>

      <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;margin-bottom:20px;">
        <p style="margin:0;color:#065f46;font-size:14px;line-height:1.6;">
          <strong>Status:</strong> Aktif &middot; Simpan email ini sebagai backup credentials.
        </p>
      </div>

      <h3 style="margin:20px 0 8px 0;font-size:15px;color:#111827;">Credentials Akses</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        ${credRows || '<tr><td style="padding:14px;color:#6b7280;font-size:14px;">Tidak ada credentials.</td></tr>'}
      </table>

      ${cpanel ? ctaButton('Buka cPanel', String(cpanel)) : ''}

      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          <strong>Penting:</strong> Jangan share credentials ini ke siapapun. Ganti password setelah login pertama.
        </p>
      </div>
    </td>
  </tr>`;

  return baseLayout({
    title: `${service} aktif - ${BRAND.name}`,
    preheader: `${service} sudah aktif. Cek credentials akses di sini.`,
    body,
  });
}

export function passwordResetEmail(name: string, resetLink: string): string {
  const safeName = escapeHtml(name || 'Sobat Zentra');
  const body = `
  <tr>
    <td class="px" style="padding:36px 32px 8px 32px;">
      <h1 class="h1" style="margin:0 0 12px 0;font-size:24px;color:#111827;font-weight:700;">Reset Password</h1>
      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo ${safeName}, kami menerima permintaan reset password untuk akun ${BRAND.name} kamu.
        Klik tombol di bawah untuk membuat password baru.
      </p>
      ${ctaButton('Reset Password Sekarang', resetLink)}
      <p style="margin:8px 0 16px 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Link berlaku selama <strong>60 menit</strong>. Kalau tombol tidak bisa diklik, salin URL berikut:
      </p>
      <p style="margin:0 0 24px 0;color:#6366f1;font-size:12px;line-height:1.5;word-break:break-all;font-family:'Courier New',monospace;">
        ${escapeHtml(resetLink)}
      </p>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.6;">
          Bukan kamu yang minta? Abaikan email ini — password kamu tetap aman.
        </p>
      </div>
    </td>
  </tr>`;
  return baseLayout({
    title: `Reset Password - ${BRAND.name}`,
    preheader: 'Reset password akun Zentra Host kamu — link berlaku 60 menit.',
    body,
  });
}

export function supportReplyEmail(name: string, ticketId: string, reply: string): string {
  const safeName = escapeHtml(name || 'Customer');
  const safeTicket = escapeHtml(ticketId);
  // Preserve line breaks
  const safeReply = escapeHtml(reply).replace(/\n/g, '<br />');

  const body = `
  <tr>
    <td class="px" style="padding:36px 32px 8px 32px;">
      <h1 class="h1" style="margin:0 0 8px 0;font-size:22px;color:#111827;font-weight:700;">Reply dari Support</h1>
      <p style="margin:0 0 16px 0;color:#6b7280;font-size:14px;">
        Ticket <strong style="color:#111827;">#${safeTicket}</strong>
      </p>
      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo ${safeName}, tim support ${BRAND.name} udah balas ticket kamu:
      </p>

      <div style="background:#f9fafb;border-left:4px solid #6366f1;padding:16px 18px;border-radius:6px;margin-bottom:20px;">
        <p style="margin:0;color:#111827;font-size:14px;line-height:1.7;white-space:pre-wrap;">
          ${safeReply}
        </p>
      </div>

      ${ctaButton('Lihat Ticket', `${BRAND.url}/dashboard/support/${encodeURIComponent(ticketId)}`)}

      <p style="margin:8px 0 24px 0;color:#6b7280;font-size:13px;line-height:1.6;">
        Mau balas? Klik tombol di atas atau reply email ini langsung.
      </p>
    </td>
  </tr>`;

  return baseLayout({
    title: `Reply ticket #${ticketId} - ${BRAND.name}`,
    preheader: `Support membalas ticket #${ticketId} kamu.`,
    body,
  });
}
