'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createTicket } from '@/app/actions/support';
import { showToast } from '@/components/ToastProvider';

const CATEGORIES = [
  { value: 'billing', label: '💳 Billing — Pembayaran & invoice' },
  { value: 'technical', label: '🛠️ Technical — Masalah server / hosting' },
  { value: 'sales', label: '🛍️ Sales — Pertanyaan paket / upgrade' },
  { value: 'abuse', label: '⚠️ Abuse — Laporan penyalahgunaan' },
  { value: 'other', label: '📝 Lainnya' },
];

const PRIORITIES = [
  { value: 'low', label: '↓ Low — Tidak mendesak', color: 'var(--text-muted)' },
  { value: 'normal', label: '○ Normal — Standar', color: 'var(--accent)' },
  { value: 'high', label: '↑ High — Mengganggu operasional', color: 'var(--warning)' },
  { value: 'urgent', label: '⚡ Urgent — Down / kritis', color: 'var(--danger)' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'technical');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'normal');
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [error, setError] = useState<string | null>(searchParams.get('error'));

  const messageLength = message.trim().length;
  const isValid = subject.trim().length > 0 && messageLength >= 10;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await createTicket(subject, category, priority, message);
      if (result.error) {
        setError(result.error);
        showToast('Gagal: ' + result.error, 'error');
        return;
      }
      if (result.ticketId) {
        showToast('✓ Tiket berhasil dibuat', 'success');
        router.push(`/dashboard/tickets/${result.ticketId}`);
      }
    });
  }

  return (
    <>
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <Link href="/dashboard/tickets" className="hover:underline">
              ← Tiket Bantuan
            </Link>
          </div>
          <h3 className="text-lg font-bold">🎫 Buat Tiket Baru</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Jelaskan masalahmu sedetail mungkin — semakin lengkap, semakin cepat kami balas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <form onSubmit={handleSubmit} className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="mb-5">
            <label
              htmlFor="subject"
              className="block mb-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Subject <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              maxLength={200}
              placeholder="Contoh: Website saya tidak bisa diakses sejak jam 14:00"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
            />
            <small className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {subject.length}/200 karakter
            </small>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label
                htmlFor="category"
                className="block mb-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block mb-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label
              htmlFor="message"
              className="block mb-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Pesan <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={10}
              rows={8}
              placeholder="Jelaskan masalahmu detail: kapan terjadi, error apa yang muncul, langkah yang sudah dicoba, screenshot bila perlu (paste link)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input"
              style={{ resize: 'vertical', minHeight: 160, fontFamily: 'inherit' }}
            />
            <small
              className="text-xs"
              style={{ color: messageLength < 10 ? 'var(--danger)' : 'var(--text-muted)' }}
            >
              {messageLength}/10 karakter minimum {messageLength >= 10 ? '✓' : ''}
            </small>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="btn btn-primary"
            >
              {isPending ? '⏳ Mengirim...' : '📤 Kirim Tiket'}
            </button>
            <Link href="/dashboard/tickets" className="btn btn-ghost">
              Batal
            </Link>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="card">
            <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
              💡 Tips Tiket Cepat Direspon
            </h4>
            <ul className="text-xs space-y-2.5" style={{ color: 'var(--text-muted)' }}>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Pilih kategori yang sesuai biar langsung ke tim yang tepat.
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Sebutkan domain/layanan yang bermasalah.
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Lampirkan pesan error lengkap (copy-paste).
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>✓</span>
                Set priority Urgent hanya kalau benar-benar kritis (down).
              </li>
            </ul>
          </div>

          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: 'var(--gradient)' }}
          >
            <h4 className="font-bold mb-2 text-sm">⚡ Response Time</h4>
            <ul className="text-xs space-y-1.5 opacity-95">
              <li>⚡ Urgent — &lt; 30 menit</li>
              <li>↑ High — &lt; 2 jam</li>
              <li>○ Normal — &lt; 8 jam</li>
              <li>↓ Low — &lt; 24 jam</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
