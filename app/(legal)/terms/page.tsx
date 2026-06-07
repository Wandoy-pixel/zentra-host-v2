import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan layanan Zentra Host',
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

const pStyle: React.CSSProperties = {
  marginBottom: 14,
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
};

export default function TermsPage() {
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
          Syarat & Ketentuan
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Terakhir diperbarui: 7 Juni 2026
        </p>
      </header>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1. Pendahuluan</h2>
        <p style={pStyle}>
          Selamat datang di Zentra Host. Dokumen Syarat & Ketentuan ini mengatur
          hubungan hukum antara Anda sebagai pengguna dengan PT Zentra Digital
          Indonesia selaku penyedia layanan web hosting, domain, dan produk
          digital terkait. Dengan mengakses, mendaftar, atau menggunakan layanan
          kami dalam bentuk apa pun, Anda dianggap telah membaca, memahami, dan
          menyetujui seluruh ketentuan di bawah ini.
        </p>
        <p style={pStyle}>
          Apabila Anda tidak menyetujui sebagian atau seluruh isi dokumen ini,
          kami meminta Anda untuk tidak menggunakan layanan Zentra Host. Kami
          berhak meninjau dan memperbarui ketentuan ini sewaktu-waktu sesuai
          perkembangan layanan dan regulasi yang berlaku di Republik Indonesia.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2. Definisi</h2>
        <p style={pStyle}>
          Untuk memudahkan pemahaman, istilah-istilah berikut memiliki arti
          sebagai berikut sepanjang digunakan dalam dokumen ini:
        </p>
        <p style={pStyle}>
          <strong>Layanan</strong> berarti seluruh produk yang kami sediakan
          termasuk shared hosting, cloud hosting, VPS, registrasi domain,
          sertifikat SSL, serta layanan pendukung lainnya.{' '}
          <strong>Pengguna</strong> adalah perorangan atau badan hukum yang
          menggunakan Layanan kami. <strong>Akun</strong> adalah identitas
          digital yang Pengguna miliki di platform Zentra Host untuk
          mengakses Layanan. <strong>Konten</strong> berarti seluruh data, file,
          gambar, kode, atau materi yang Pengguna unggah ke server kami.{' '}
          <strong>Hari Kerja</strong> berarti Senin hingga Jumat, tidak termasuk
          hari libur nasional Republik Indonesia.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3. Penggunaan Layanan</h2>
        <p style={pStyle}>
          Pengguna setuju untuk menggunakan Layanan secara wajar, sesuai dengan
          tujuan yang dimaksudkan, serta tidak melanggar hukum yang berlaku.
          Pengguna bertanggung jawab penuh atas seluruh aktivitas yang terjadi
          melalui Akunnya, termasuk Konten yang diunggah dan dipublikasikan.
        </p>
        <p style={pStyle}>
          Kami berhak membatasi atau menghentikan akses Pengguna apabila terjadi
          penggunaan yang mengganggu kinerja server bersama, menimbulkan
          kerugian terhadap pengguna lain, atau melanggar Pasal 7 dokumen ini.
          Penggunaan resource yang melebihi batas wajar pada paket unlimited
          dapat menyebabkan peringatan, throttling, atau penangguhan layanan.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4. Akun Pengguna</h2>
        <p style={pStyle}>
          Untuk menikmati Layanan, Pengguna wajib mendaftarkan diri dengan
          memberikan informasi yang benar, akurat, dan terbaru. Setiap Akun
          hanya boleh digunakan oleh satu entitas dan tidak dapat dipindahkan
          tanpa persetujuan tertulis dari kami.
        </p>
        <p style={pStyle}>
          Pengguna bertanggung jawab menjaga kerahasiaan kata sandi dan kredensial
          login. Setiap aktivitas yang terjadi melalui Akun Pengguna dianggap
          sebagai tindakan Pengguna sendiri. Apabila terjadi dugaan akses tidak
          sah, Pengguna wajib segera menghubungi tim support kami melalui kanal
          resmi.
        </p>
        <p style={pStyle}>
          Pengguna minimal berusia 17 tahun atau telah memiliki KTP. Untuk
          Pengguna di bawah usia tersebut, pendaftaran harus dilakukan oleh
          orang tua atau wali yang sah secara hukum.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5. Pembayaran & Penagihan</h2>
        <p style={pStyle}>
          Seluruh harga yang ditampilkan di situs Zentra Host sudah termasuk
          Pajak Pertambahan Nilai (PPN) sesuai ketentuan perpajakan yang berlaku
          di Indonesia. Pembayaran dilakukan di muka berdasarkan siklus tagihan
          yang dipilih, yakni bulanan, tahunan, atau periode lain yang tersedia.
        </p>
        <p style={pStyle}>
          Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI,
          BRI), e-wallet (GoPay, OVO, DANA, ShopeePay), kartu kredit Visa /
          Mastercard, serta QRIS. Layanan akan otomatis aktif setelah pembayaran
          terkonfirmasi pada sistem kami.
        </p>
        <p style={pStyle}>
          Apabila Pengguna terlambat melakukan pembayaran perpanjangan, layanan
          akan masuk ke status suspended selama 7 hari, kemudian dihapus
          permanen apabila tidak ada perpanjangan dalam 30 hari berikutnya.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>6. Kebijakan Refund</h2>
        <p style={pStyle}>
          Kami memberikan garansi pengembalian dana 30 hari untuk seluruh paket
          shared hosting tanpa syarat khusus. Pengguna dapat mengajukan refund
          melalui dashboard atau menghubungi tim support kami.
        </p>
        <p style={pStyle}>
          Untuk detail lengkap mengenai layanan yang dapat di-refund,
          pengecualian, serta proses pengajuan, silakan baca{' '}
          <Link
            href="/refund"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Kebijakan Refund
          </Link>{' '}
          kami secara menyeluruh.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>7. Konten yang Dilarang</h2>
        <p style={pStyle}>
          Pengguna dilarang menggunakan Layanan Zentra Host untuk menyimpan,
          mendistribusikan, atau memfasilitasi konten berikut: materi yang
          melanggar hak kekayaan intelektual pihak lain, pornografi (termasuk
          pornografi anak), spam, phishing, malware, virus, ransomware, dan
          segala bentuk software berbahaya.
        </p>
        <p style={pStyle}>
          Selain itu, dilarang menjalankan aktivitas seperti cryptocurrency
          mining, layanan proxy ilegal, botnet, DDoS, brute force, judi online,
          penipuan investasi, multi-level marketing yang merugikan, serta konten
          yang menyebarkan kebencian berbasis SARA atau mengancam kedaulatan
          Negara Kesatuan Republik Indonesia.
        </p>
        <p style={pStyle}>
          Pelanggaran ketentuan ini dapat berakibat pada penangguhan layanan
          tanpa pemberitahuan terlebih dahulu, tanpa hak refund, serta pelaporan
          ke pihak berwenang apabila diperlukan.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>8. Hak Kekayaan Intelektual</h2>
        <p style={pStyle}>
          Seluruh elemen platform Zentra Host, termasuk namun tidak terbatas
          pada logo, merek dagang, antarmuka pengguna, kode sumber, dokumentasi,
          serta materi pemasaran adalah milik PT Zentra Digital Indonesia dan
          dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.
        </p>
        <p style={pStyle}>
          Pengguna tetap memegang penuh hak kekayaan intelektual atas Konten
          yang diunggah ke server kami. Dengan menggunakan Layanan, Pengguna
          memberikan kami lisensi terbatas untuk menyimpan, memproses, serta
          menyajikan Konten tersebut semata-mata untuk keperluan teknis
          penyediaan Layanan.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>9. Batasan Tanggung Jawab</h2>
        <p style={pStyle}>
          Layanan disediakan dalam kondisi "as-is" dengan komitmen uptime 99,9%
          per bulan. Meskipun kami berusaha memberikan layanan terbaik, kami
          tidak menjamin bahwa Layanan akan bebas dari gangguan, kesalahan, atau
          kerusakan teknis akibat keadaan kahar (force majeure).
        </p>
        <p style={pStyle}>
          Tanggung jawab Zentra Host atas kerugian yang dialami Pengguna dibatasi
          maksimal sebesar nilai biaya layanan yang dibayarkan Pengguna pada 3
          (tiga) bulan terakhir sebelum kejadian. Kami tidak bertanggung jawab
          atas kehilangan keuntungan, kerugian data akibat kelalaian Pengguna,
          atau kerugian tidak langsung lainnya.
        </p>
        <p style={pStyle}>
          Pengguna wajib melakukan backup mandiri secara berkala. Walaupun kami
          menyediakan backup otomatis, fitur tersebut bersifat bantuan dan bukan
          jaminan utama atas keamanan data Pengguna.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>10. Penghentian Layanan</h2>
        <p style={pStyle}>
          Pengguna dapat menghentikan Layanan kapan saja melalui dashboard
          masing-masing. Kami juga berhak menghentikan Layanan secara sepihak
          apabila Pengguna terbukti melanggar Syarat & Ketentuan ini, melakukan
          tindakan melawan hukum, atau menunggak pembayaran lebih dari 30 hari.
        </p>
        <p style={pStyle}>
          Setelah penghentian, seluruh data yang tersimpan di server akan dihapus
          permanen dalam waktu 30 hari. Pengguna disarankan untuk mengunduh dan
          memindahkan data sebelum tanggal penghentian efektif.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>11. Perubahan Syarat</h2>
        <p style={pStyle}>
          Kami berhak mengubah, menambah, atau mengurangi isi Syarat & Ketentuan
          ini sewaktu-waktu sesuai perkembangan layanan dan regulasi. Perubahan
          akan diumumkan melalui email terdaftar dan/atau notifikasi di
          dashboard, paling lambat 14 hari sebelum berlaku.
        </p>
        <p style={pStyle}>
          Penggunaan Layanan secara terus-menerus setelah tanggal efektif
          perubahan dianggap sebagai persetujuan Pengguna terhadap versi terbaru.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>12. Hukum yang Berlaku</h2>
        <p style={pStyle}>
          Syarat & Ketentuan ini disusun dan ditafsirkan berdasarkan hukum yang
          berlaku di Republik Indonesia. Setiap sengketa yang timbul akan
          diselesaikan terlebih dahulu melalui musyawarah secara kekeluargaan.
        </p>
        <p style={pStyle}>
          Apabila musyawarah tidak mencapai kesepakatan, kedua belah pihak
          sepakat untuk menyelesaikan sengketa melalui Pengadilan Negeri Jakarta
          Pusat sebagai forum hukum yang berwenang.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>13. Kontak</h2>
        <p style={pStyle}>
          Apabila Anda memiliki pertanyaan, masukan, atau keluhan terkait Syarat
          & Ketentuan ini, jangan ragu untuk menghubungi kami melalui:
        </p>
        <p style={pStyle}>
          Email: <strong>legal@zentra.id</strong>
          <br />
          Telepon / WhatsApp: <strong>+62 812-3456-7890</strong>
          <br />
          Alamat: Jl. Sudirman No. 123, Jakarta Pusat 10220, Indonesia
          <br />
          Halaman kontak:{' '}
          <Link
            href="/kontak"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            zentra.id/kontak
          </Link>
        </p>
      </section>
    </article>
  );
}
