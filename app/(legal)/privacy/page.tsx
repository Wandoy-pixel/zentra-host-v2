import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi Zentra Host sesuai UU Pelindungan Data Pribadi Republik Indonesia',
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

export default function PrivacyPage() {
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
          Kebijakan Privasi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Terakhir diperbarui: 7 Juni 2026
        </p>
      </header>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1. Komitmen Kami</h2>
        <p style={pStyle}>
          Privasi Anda adalah prioritas utama bagi Zentra Host. Dokumen ini
          menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
          melindungi data pribadi Anda sesuai dengan Undang-Undang Nomor 27
          Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) dan peraturan
          turunannya.
        </p>
        <p style={pStyle}>
          Dengan menggunakan layanan kami, Anda memberikan persetujuan eksplisit
          atas pemrosesan data pribadi sebagaimana dijelaskan dalam dokumen ini.
          Kami berkomitmen untuk memproses data Anda secara transparan, sah,
          serta hanya untuk tujuan yang dijelaskan secara spesifik.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2. Data Yang Kami Kumpulkan</h2>
        <p style={pStyle}>
          Kami mengumpulkan beberapa kategori data pribadi berdasarkan
          kebutuhan layanan, antara lain:
        </p>

        <h3 style={h3Style}>2.1 Data Identitas</h3>
        <ul style={ulStyle}>
          <li>Nama lengkap sesuai dokumen identitas resmi</li>
          <li>Alamat email aktif</li>
          <li>Nomor telepon / WhatsApp</li>
          <li>Alamat surat-menyurat (untuk faktur dan dokumen pajak)</li>
        </ul>

        <h3 style={h3Style}>2.2 Data Teknis</h3>
        <ul style={ulStyle}>
          <li>Alamat IP saat mengakses platform</li>
          <li>Tipe perangkat, sistem operasi, dan browser</li>
          <li>Log aktivitas login dan tindakan di dashboard</li>
          <li>Cookies dan identifier serupa</li>
        </ul>

        <h3 style={h3Style}>2.3 Data Transaksi</h3>
        <ul style={ulStyle}>
          <li>Riwayat pembelian dan perpanjangan layanan</li>
          <li>Metode pembayaran yang digunakan (tanpa menyimpan detail kartu)</li>
          <li>Faktur dan bukti transaksi</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3. Cara Kami Menggunakan Data</h2>
        <p style={pStyle}>
          Data pribadi yang kami kumpulkan digunakan untuk tujuan-tujuan
          berikut, sesuai prinsip pembatasan tujuan dalam UU PDP:
        </p>
        <ul style={ulStyle}>
          <li>Membuat dan mengelola akun Anda di platform Zentra Host</li>
          <li>
            Memproses transaksi pembayaran dan menerbitkan faktur sesuai
            peraturan perpajakan
          </li>
          <li>Memberikan dukungan teknis melalui email, chat, atau telepon</li>
          <li>
            Mengirim notifikasi penting terkait status layanan, pembayaran, dan
            keamanan akun
          </li>
          <li>
            Meningkatkan kualitas layanan melalui analisis penggunaan secara
            agregat dan anonim
          </li>
          <li>Mencegah penipuan, penyalahgunaan, dan pelanggaran hukum</li>
          <li>
            Mematuhi kewajiban hukum seperti permintaan resmi dari otoritas
            berwenang
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4. Pembagian Data dengan Pihak Ketiga</h2>
        <p style={pStyle}>
          Kami tidak menjual data pribadi Anda kepada pihak mana pun. Namun
          dalam operasional layanan, kami bekerja sama dengan beberapa
          processor data pihak ketiga yang telah memiliki standar keamanan dan
          kepatuhan setara, yaitu:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Supabase</strong> – penyedia backend dan database
            ter-enkripsi untuk menyimpan data akun dan transaksi
          </li>
          <li>
            <strong>Vercel</strong> – penyedia infrastruktur hosting aplikasi
            untuk frontend dashboard
          </li>
          <li>
            <strong>Payment Gateway</strong> (Midtrans, Xendit, atau penyedia
            sejenis) – pemrosesan pembayaran sesuai standar PCI DSS
          </li>
          <li>
            <strong>Penyedia email transaksional</strong> (Resend / Postmark)
            untuk mengirim notifikasi dan faktur
          </li>
          <li>
            <strong>Layanan analitik</strong> (anonim, tanpa identifikasi
            personal) untuk memahami penggunaan platform
          </li>
        </ul>
        <p style={pStyle}>
          Kami juga dapat membagikan data kepada aparat penegak hukum apabila
          terdapat permintaan resmi berdasarkan peraturan perundang-undangan
          yang berlaku.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5. Cookies & Tracking</h2>
        <p style={pStyle}>
          Kami menggunakan cookies untuk meningkatkan pengalaman penggunaan
          situs. Cookies yang kami pakai meliputi:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Cookies esensial</strong> – wajib untuk fungsi login,
            keranjang, dan keamanan sesi
          </li>
          <li>
            <strong>Cookies preferensi</strong> – menyimpan pilihan tema (gelap
            / terang) dan bahasa
          </li>
          <li>
            <strong>Cookies analitik</strong> – mengukur performa halaman tanpa
            mengidentifikasi pengguna secara personal
          </li>
        </ul>
        <p style={pStyle}>
          Anda dapat menonaktifkan cookies melalui pengaturan browser, namun
          beberapa fitur platform mungkin tidak berfungsi optimal.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>6. Keamanan Data</h2>
        <p style={pStyle}>
          Kami menerapkan langkah-langkah keamanan teknis dan organisasional
          berlapis untuk melindungi data pribadi Anda:
        </p>
        <ul style={ulStyle}>
          <li>
            Enkripsi data saat transit menggunakan TLS 1.3 dan saat istirahat
            (at-rest) dengan AES-256
          </li>
          <li>
            Row Level Security (RLS) pada database untuk membatasi akses data
            antar pengguna
          </li>
          <li>Autentikasi dua faktor (2FA) untuk akun dashboard</li>
          <li>Audit log pada seluruh aktivitas administrasi</li>
          <li>Backup terenkripsi yang disimpan di lokasi terpisah</li>
          <li>Pelatihan keamanan rutin bagi seluruh tim internal</li>
        </ul>
        <p style={pStyle}>
          Apabila terjadi insiden kebocoran data, kami berkomitmen
          memberitahukan kepada Anda dan otoritas pengawas dalam waktu
          maksimal 3x24 jam sesuai ketentuan UU PDP.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>7. Hak Pengguna</h2>
        <p style={pStyle}>
          Sesuai UU PDP, Anda memiliki hak-hak berikut atas data pribadi Anda:
        </p>
        <ul style={ulStyle}>
          <li>
            <strong>Hak akses</strong> – meminta salinan data pribadi yang kami
            simpan
          </li>
          <li>
            <strong>Hak ralat</strong> – memperbarui atau mengoreksi data yang
            tidak akurat
          </li>
          <li>
            <strong>Hak hapus</strong> – meminta penghapusan data pribadi
            (right to be forgotten)
          </li>
          <li>
            <strong>Hak portabilitas</strong> – meminta data dalam format
            terstruktur yang dapat dipindahkan ke penyedia lain
          </li>
          <li>
            <strong>Hak menolak pemrosesan</strong> – membatasi pemrosesan
            untuk tujuan tertentu seperti pemasaran
          </li>
          <li>
            <strong>Hak menarik persetujuan</strong> – mencabut persetujuan
            yang sebelumnya diberikan
          </li>
          <li>
            <strong>Hak mengajukan keluhan</strong> – kepada otoritas
            pengawas pelindungan data
          </li>
        </ul>
        <p style={pStyle}>
          Untuk menggunakan hak-hak ini, silakan ajukan permintaan melalui
          email DPO kami. Kami akan merespons paling lambat 14 hari kerja sejak
          permintaan diterima.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>8. Penyimpanan Data</h2>
        <p style={pStyle}>
          Kami menyimpan data pribadi Anda hanya selama diperlukan untuk
          memenuhi tujuan pengumpulan, atau selama dipersyaratkan oleh peraturan
          perundang-undangan yang berlaku.
        </p>
        <p style={pStyle}>
          Data akun aktif disimpan sepanjang Anda menggunakan layanan. Setelah
          akun dihentikan, data akan kami pertahankan maksimal 5 tahun untuk
          keperluan audit pajak dan kepatuhan, kecuali ada permintaan
          penghapusan eksplisit dari Anda dan tidak bertentangan dengan
          kewajiban hukum kami.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>9. Transfer Data Internasional</h2>
        <p style={pStyle}>
          Sebagian processor pihak ketiga kami beroperasi di luar wilayah
          Indonesia, antara lain di Singapura, Amerika Serikat, dan Eropa.
          Transfer data lintas batas dilakukan hanya kepada negara yang memiliki
          tingkat pelindungan data setara atau lebih tinggi.
        </p>
        <p style={pStyle}>
          Setiap transfer data internasional dilindungi dengan kontrak Standard
          Contractual Clauses (SCC) dan mekanisme keamanan tambahan sesuai
          rekomendasi otoritas pelindungan data.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>10. Anak di Bawah Umur</h2>
        <p style={pStyle}>
          Layanan Zentra Host tidak ditujukan untuk anak di bawah usia 17 tahun.
          Kami tidak secara sadar mengumpulkan data pribadi dari anak di bawah
          umur tanpa persetujuan orang tua atau wali yang sah.
        </p>
        <p style={pStyle}>
          Apabila Anda mengetahui adanya data anak di bawah umur yang
          terkumpul tanpa persetujuan, mohon segera hubungi DPO kami agar dapat
          segera dihapus.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>11. Perubahan Kebijakan</h2>
        <p style={pStyle}>
          Kebijakan Privasi ini dapat kami perbarui dari waktu ke waktu untuk
          mencerminkan perubahan layanan, teknologi, atau regulasi. Perubahan
          material akan kami informasikan melalui email terdaftar paling lambat
          14 hari sebelum berlaku efektif.
        </p>
        <p style={pStyle}>
          Versi terbaru selalu dapat diakses di halaman ini dengan tanggal
          pembaruan terakhir yang tertera di bagian atas.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>12. Kontak Data Protection Officer</h2>
        <p style={pStyle}>
          Untuk pertanyaan, permintaan terkait hak Anda, atau keluhan mengenai
          pelindungan data pribadi, silakan hubungi Data Protection Officer
          (DPO) kami:
        </p>
        <p style={pStyle}>
          Nama: <strong>Tim DPO Zentra Host</strong>
          <br />
          Email: <strong>dpo@zentra.id</strong>
          <br />
          Telepon: <strong>+62 812-3456-7890</strong>
          <br />
          Alamat: Jl. Sudirman No. 123, Jakarta Pusat 10220, Indonesia
          <br />
          Halaman kontak umum:{' '}
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
