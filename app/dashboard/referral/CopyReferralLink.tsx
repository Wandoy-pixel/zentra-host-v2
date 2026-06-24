'use client';

import { useState } from 'react';
import { showToast } from '@/components/ToastProvider';

type Props = {
  link: string;
  code: string;
};

export default function CopyReferralLink({ link, code }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard(text: string, label = 'Link') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback untuk browser/HTTP context lama
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      showToast(`${label} berhasil disalin!`, 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      showToast('Gagal menyalin link, coba manual ya.', 'error');
    }
  }

  const shareText = encodeURIComponent(
    `Halo! Aku pakai Zentra Host buat hosting & domain — cepat, murah, support 24/7. Daftar pakai link aku biar dapet bonus: ${link}`
  );
  const shareTextNoLink = encodeURIComponent(
    `Halo! Aku pakai Zentra Host buat hosting & domain — cepat, murah, support 24/7. Daftar pakai link aku biar dapet bonus:`
  );

  const waUrl = `https://wa.me/?text=${shareText}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${shareTextNoLink}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="space-y-4">
      {/* Link box + copy */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{
          background: 'rgba(20,184,166,0.08)',
          border: '1px dashed rgba(20,184,166,0.4)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            Kode referral kamu: <span className="font-bold" style={{ color: 'var(--accent)' }}>{code}</span>
          </p>
          <p
            className="font-mono text-sm truncate select-all"
            style={{ color: 'var(--text)' }}
            title={link}
          >
            {link}
          </p>
        </div>
        <button
          onClick={() => copyToClipboard(link, 'Link referral')}
          className="btn btn-primary text-sm whitespace-nowrap"
          style={{ minWidth: 110 }}
        >
          {copied ? '✓ Tersalin' : '📋 Salin Link'}
        </button>
      </div>

      {/* Share buttons */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          Bagikan via:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(34,158,217,0.15)', color: '#229ED9', border: '1px solid rgba(34,158,217,0.3)' }}
          >
            <span>✈️</span> Telegram
          </a>
          <a
            href={twUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(29,161,242,0.15)', color: '#1DA1F2', border: '1px solid rgba(29,161,242,0.3)' }}
          >
            <span>🐦</span> Twitter
          </a>
          <button
            onClick={() => copyToClipboard(link, 'Link referral')}
            className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: 'rgba(139,147,167,0.12)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            <span>📋</span> Copy
          </button>
        </div>
      </div>
    </div>
  );
}
