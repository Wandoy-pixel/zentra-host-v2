'use client';

import { useState } from 'react';
import { fmtDate } from '@/lib/data';

type FtpInfo = {
  host: string;
  port: number;
  username: string;
  password: string;
};

type MysqlInfo = {
  host: string;
  database: string;
  username: string;
  password: string;
};

type Props = {
  provisioningId: number;
  subdomain: string;
  ftp: FtpInfo;
  mysql: MysqlInfo;
  activatedAt: string | null;
  expiresAt: string | null;
};

function maskValue(value: string): string {
  if (!value || value.length < 6) return '••••••••';
  return value.slice(0, 2) + '••••••••••' + value.slice(-2);
}

function CredentialRow({
  label,
  value,
  secret = false,
  monospace = true,
}: {
  label: string;
  value: string | number;
  secret?: boolean;
  monospace?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const strValue = String(value);
  const display = secret && !revealed ? maskValue(strValue) : strValue;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(strValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-3 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
        <div
          className={`text-sm break-all ${monospace ? 'font-mono' : ''}`}
          style={{ color: 'var(--text)' }}
        >
          {display}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="btn btn-secondary text-xs px-3 py-1.5"
            title={revealed ? 'Sembunyikan' : 'Tampilkan'}
          >
            {revealed ? '🙈 Sembunyikan' : '👁️ Tampilkan'}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-secondary text-xs px-3 py-1.5"
          title="Salin ke clipboard"
        >
          {copied ? '✅ Tersalin' : '📋 Salin'}
        </button>
      </div>
    </div>
  );
}

export default function HostingDetailClient({
  provisioningId,
  subdomain,
  ftp,
  mysql,
  activatedAt,
  expiresAt,
}: Props) {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function handleResetFtp() {
    if (resetting) return;
    const ok = window.confirm(
      'Reset password FTP? Password lama akan langsung tidak berlaku.'
    );
    if (!ok) return;
    setResetting(true);
    setResetMsg(null);
    // Mock simulation - production akan call server action
    await new Promise((r) => setTimeout(r, 1200));
    setResetting(false);
    setResetMsg(
      'Permintaan reset password FTP terkirim. Password baru akan dikirim ke email Anda dalam beberapa menit.'
    );
    setTimeout(() => setResetMsg(null), 6000);
  }

  return (
    <>
      {/* Subdomain */}
      <div className="card">
        <h3 className="text-lg font-bold mb-2">🌐 Subdomain Hosting</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          URL default untuk akses website Anda sebelum domain di-pointing.
        </p>
        <CredentialRow label="Subdomain" value={subdomain} monospace />
        <div className="mt-3 flex gap-2 flex-wrap">
          <a
            href={`https://${subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            🔗 Buka di tab baru
          </a>
        </div>
      </div>

      {/* FTP Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="text-lg font-bold">📁 FTP Access</h3>
          <button
            type="button"
            onClick={handleResetFtp}
            disabled={resetting}
            className="btn btn-secondary text-sm"
          >
            {resetting ? '⏳ Memproses...' : '🔄 Reset Password FTP'}
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Gunakan FileZilla, WinSCP, atau Cyberduck untuk upload file.
        </p>
        {resetMsg && (
          <div
            className="mb-3 p-3 rounded text-sm"
            style={{
              background: 'var(--success-bg, rgba(34,197,94,0.1))',
              color: 'var(--success, #16a34a)',
              border: '1px solid var(--success, #16a34a)',
            }}
          >
            {resetMsg}
          </div>
        )}
        <CredentialRow label="FTP Host" value={ftp.host} />
        <CredentialRow label="Port" value={ftp.port} />
        <CredentialRow label="Username" value={ftp.username} />
        <CredentialRow label="Password" value={ftp.password} secret />
      </div>

      {/* MySQL Info */}
      <div className="card">
        <h3 className="text-lg font-bold mb-2">🗄️ MySQL Database</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Credentials untuk koneksi database aplikasi Anda (wp-config.php, .env, dll).
        </p>
        <CredentialRow label="Host" value={mysql.host} />
        <CredentialRow label="Database" value={mysql.database} />
        <CredentialRow label="Username" value={mysql.username} />
        <CredentialRow label="Password" value={mysql.password} secret />
      </div>

      {/* Periode */}
      <div className="card">
        <h3 className="text-lg font-bold mb-3">📅 Masa Berlaku</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Diaktifkan
            </div>
            <div className="text-sm font-semibold">
              {activatedAt ? fmtDate(activatedAt) : '-'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Kadaluarsa
            </div>
            <div className="text-sm font-semibold">
              {expiresAt ? fmtDate(expiresAt) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div
        className="card"
        style={{
          borderLeft: '3px solid var(--warning, #f59e0b)',
        }}
      >
        <div className="flex gap-3">
          <div className="text-2xl">🔒</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Jaga kerahasiaan credentials.</strong>{' '}
            Jangan share password ini ke siapapun. Zentra Host tidak pernah meminta
            password via email/chat. Service ID: <span className="font-mono">#{provisioningId}</span>
          </div>
        </div>
      </div>
    </>
  );
}
