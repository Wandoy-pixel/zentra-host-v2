import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Refund',
  description:
    'Kebijakan pengembalian dana (refund) untuk layanan Zentra Host — garansi 30 hari.',
};

const sectionStyle: React.CSSProperties = {
  paddingTop: 20,
  paddingBottom: 20,
};

const h2Style: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: 12,
  marginTop: 8,
  letterSpacing: '-0.3px',
};

const h3Style: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: 8,
  marginTop: 14,
};

const pStyle: React.CSSProperties = {
  marginBottom: 14,
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
};

const ulStyle: React.CSSProperties = {
  marginBottom: 14,
  paddingLeft: 22,
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
};

const calloutStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
};

export default function RefundPage() {
  return (
    <article>
      <header style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: 10,
          }}
        >
          Kebijakan Refund
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Terakhir diperbarui: 7 Juni 2026
        </p>
      </header>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1. Garansi 30 Hari</h2>
        <div style={calloutStyle}>
          <p style={{ ...pStyle, marginBottom: 0, color: 'var(--text)' }}>
            <strong>Garansi uang kembali 30 hari tanpa syarat</strong> berlaku
            untuk seluruh paket <strong>shared hosting</strong> baru. Apabila
            Anda merasa layanan kami tidak sesuai harapan, ajukan refund dalam
            30 hari pertama dan dana akan kami kembalikan 100%.
          </p>
        </div>
        <p style={pStyle}>
          Garansi ini merupakan komitmen kami untuk memberikan Anda kesempatan
          mencoba layanan tanpa risiko. Kami tidak meminta alasan rumit, cukup
          ajukan refund melalui dashboard atau hubungi tim support kami.
        </p>
        <p style={pStyle}>
          Garansi 30 hari hanya berlaku satu kali per pengguna untuk paket
          shared hosting pertama yang dibeli. Pembelian berikutnya, perpanjangan,
          atau pembelian paket lain mengikuti ketentuan refund pro-rata yang
          berlaku.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2. Layanan Yang Bisa Di-refund</h2>
        <p style={pStyle}>
          Layanan berikut termasuk dalam program garansi pengembalian dana:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Shared Hosting</strong> – seluruh paket (Starter, Business,
            Pro) dengan garansi 30 hari penuh
          </li>
          <li>
            <strong>Cloud Hosting</strong> – garansi 14 hari dengan
            pengembalian pro-rata
          </li>
          <li>
            <strong>Reseller Hosting</strong> – garansi 30 hari sepanjang
            belum digunakan untuk menjual layanan ke pihak ketiga
          </li>
          <li>
            <strong>Layanan add-on premium</strong> seperti backup tambahan,
            CDN premium, atau email storage (dalam 7 hari)
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3. Layanan TIDAK Bisa Di-refund</h2>
        <p style={pStyle}>
          Mohon dicatat, layanan berikut tidak termasuk dalam program refund
          karena sifat produk yang melibatkan biaya pihak ketiga atau telah
          diaktifkan secara permanen:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Registrasi domain</strong> – semua TLD (.id, .com, .net, dll)
            karena biaya sudah dibayarkan ke registrar
          </li>
          <li>
            <strong>Perpanjangan domain</strong> – mengikuti kebijakan registrar
          </li>
          <li>
            <strong>Sertifikat SSL berbayar</strong> – DV, OV, EV, dan Wildcard
            yang sudah terbit
          </li>
          <li>
            <strong>Lisensi software pihak ketiga</strong> – cPanel, Plesk,
            LiteSpeed, atau lisensi terkait
          </li>
          <li>
            <strong>VPS dan Dedicated Server</strong> – karena resource sudah
            dialokasikan secara dedicated
          </li>
          <li>
            <strong>Layanan migrasi premium</strong> setelah pekerjaan migrasi
            dimulai oleh tim kami
          </li>
          <li>
            <strong>Biaya setup</strong>, biaya administrasi, dan layanan
            konsultasi yang sudah dilaksanakan
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4. Cara Mengajukan Refund</h2>
        <p style={pStyle}>
          Pengajuan refund dapat dilakukan dengan dua cara yang sama-sama mudah:
        </p>

        <h3 style={h3Style}>4.1 Melalui Dashboard</h3>
        <ul style={ulStyle}>
          <li>Login ke dashboard Zentra Host</li>
          <li>Buka menu "Layanan Saya" dan pilih layanan yang ingin di-refund</li>
          <li>Klik tombol "Ajukan Refund" dan isi formulir singkat</li>
          <li>Tim kami akan memproses pengajuan dalam 1x24 jam</li>
        </ul>

        <h3 style={h3Style}>4.2 Melalui Tim Support</h3>
        <ul style={ulStyle}>
          <li>
            Email ke <strong>refund@zentra.id</strong> dengan subjek
            "Pengajuan Refund - [Nomor Invoice]"
          </li>
          <li>Sertakan nomor invoice dan alasan refund (opsional)</li>
          <li>
            Atau chat WhatsApp ke <strong>+62 812-3456-7890</strong> jam
            operasional 24/7
          </li>
        </ul>
        <p style={pStyle}>
          Untuk mempercepat proses, mohon siapkan nomor invoice, email yang
          terdaftar, dan rekening tujuan pengembalian dana.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5. Proses & Waktu Refund</h2>
        <p style={pStyle}>
          Setelah pengajuan refund Anda diterima, kami akan melakukan verifikasi
          terlebih dahulu untuk memastikan kelengkapan data dan kelayakan
          permintaan. Tahapan prosesnya sebagai berikut:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Hari ke-1</strong> – Konfirmasi penerimaan pengajuan via
            email dalam 24 jam
          </li>
          <li>
            <strong>Hari ke-1 s/d 3</strong> – Verifikasi kelayakan refund oleh
            tim billing
          </li>
          <li>
            <strong>Hari ke-3 s/d 7</strong> – Penonaktifan layanan dan
            pemrosesan transfer dana
          </li>
          <li>
            <strong>Hari ke-7 s/d 14</strong> – Dana diterima di rekening Anda
            tergantung metode pembayaran awal
          </li>
        </ul>
        <p style={pStyle}>
          Total waktu pemrosesan refund: <strong>maksimal 14 hari kerja</strong>{' '}
          sejak pengajuan disetujui. Untuk pembayaran via kartu kredit, refund
          biasanya muncul di tagihan billing siklus berikutnya.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>6. Metode Refund</h2>
        <p style={pStyle}>
          Refund akan dikembalikan menggunakan metode pembayaran yang sama
          dengan pembayaran awal, sesuai prinsip keamanan transaksi:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Transfer Bank</strong> – dikembalikan ke rekening yang sama
            dengan pembayaran awal
          </li>
          <li>
            <strong>E-wallet (GoPay, OVO, DANA, ShopeePay)</strong> –
            dikembalikan ke akun e-wallet yang sama
          </li>
          <li>
            <strong>Kartu Kredit Visa / Mastercard</strong> – dikembalikan ke
            kartu yang digunakan, muncul di tagihan berikutnya
          </li>
          <li>
            <strong>QRIS</strong> – dikembalikan ke rekening bank yang
            terdaftar di akun, dengan konfirmasi tambahan
          </li>
        </ul>
        <p style={pStyle}>
          Apabila metode pembayaran awal tidak lagi tersedia (misalnya kartu
          kredit hangus), refund akan dialihkan ke rekening bank yang Anda
          tunjuk setelah verifikasi identitas.
        </p>
        <p style={pStyle}>
          Refund tidak dikenakan biaya admin dari pihak Zentra Host, namun
          biaya transfer antarbank atau biaya konversi mata uang (jika ada)
          akan ditanggung sesuai ketentuan masing-masing bank.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>7. Pengecualian</h2>
        <p style={pStyle}>
          Pengajuan refund dapat kami tolak dalam kondisi berikut, demi
          melindungi pengguna lain dan integritas platform:
        </p>
        <ul style={ulStyle}>
          <li>
            Akun terbukti melakukan pelanggaran Syarat & Ketentuan, terutama
            Pasal 7 mengenai konten yang dilarang
          </li>
          <li>
            Penggunaan bersifat abusive seperti spam, phishing, malware,
            cryptocurrency mining, atau DDoS
          </li>
          <li>
            Penyalahgunaan kebijakan refund, misalnya berulang kali mengajukan
            refund untuk paket yang sama
          </li>
          <li>
            Akun di-suspend karena tunggakan pembayaran sebelum pengajuan
            refund diajukan
          </li>
          <li>
            Pengajuan dilakukan lebih dari 30 hari setelah tanggal aktivasi
            untuk paket shared hosting
          </li>
          <li>
            Pengguna telah memanfaatkan promo khusus dengan syarat tidak dapat
            di-refund (akan dijelaskan saat pembelian)
          </li>
          <li>
            Layanan telah digunakan secara intensif dengan resource yang
            melebihi batas wajar
          </li>
        </ul>
        <p style={pStyle}>
          Apabila pengajuan refund Anda ditolak, kami akan memberikan penjelasan
          tertulis disertai bukti pendukung yang relevan. Anda berhak meninjau
          ulang keputusan melalui mekanisme banding ke tim manajemen.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Butuh bantuan?</h2>
        <p style={pStyle}>
          Tim customer support kami siap membantu Anda 24/7. Untuk informasi
          lebih lanjut, silakan kunjungi halaman{' '}
          <Link
            href="/kontak"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Kontak
          </Link>{' '}
          atau baca{' '}
          <Link
            href="/terms"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Syarat & Ketentuan
          </Link>{' '}
          kami secara lengkap.
        </p>
      </section>
    </article>
  );
}
