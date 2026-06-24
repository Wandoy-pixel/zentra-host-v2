'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/app/actions/resources';
import {
  toggleTwoFactor,
  getTwoFactorStatus,
  generateBackupCodes,
  logoutAllDevices,
} from '@/app/actions/security';
import { showToast } from '@/components/ToastProvider';
import { fmtDate } from '@/lib/data';

type LoginEntry = {
  timestamp: string;
  ip: string;
  device: string;
  location: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    fullname: string;
    phone: string;
    role: string;
    created_at: string;
    email: string;
    id: string;
  } | null>(null);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupMode, setSetupMode] = useState(false);

  // Mock data — sesi aktif & riwayat login (UI showcase)
  const activeSessions = [
    { device: 'Chrome di Windows 11', location: 'Jakarta, ID', current: true, lastActive: 'Sekarang' },
    { device: 'Safari di iPhone 14', location: 'Bandung, ID', current: false, lastActive: '2 jam lalu' },
  ];

  const loginHistory: LoginEntry[] = [
    { timestamp: '2026-06-24 09:12', ip: '103.21.45.12', device: 'Chrome / Windows', location: 'Jakarta, ID' },
    { timestamp: '2026-06-23 21:05', ip: '103.21.45.12', device: 'Chrome / Windows', location: 'Jakarta, ID' },
    { timestamp: '2026-06-23 14:30', ip: '180.244.12.99', device: 'Safari / iPhone', location: 'Bandung, ID' },
    { timestamp: '2026-06-22 19:45', ip: '103.21.45.12', device: 'Chrome / Windows', location: 'Jakarta, ID' },
    { timestamp: '2026-06-21 08:20', ip: '202.67.40.11', device: 'Firefox / Linux', location: 'Surabaya, ID' },
  ];

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile({
        fullname: data?.fullname || '',
        phone: data?.phone || '',
        role: data?.role || 'customer',
        created_at: data?.created_at || user.created_at,
        email: user.email || '',
        id: user.id,
      });

      // Load 2FA status
      const status = await getTwoFactorStatus();
      setTwoFAEnabled(status.enabled);

      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateProfile(String(fd.get('fullname')), String(fd.get('phone')));
    if ('error' in result) showToast('Gagal: ' + result.error, 'error');
    else {
      showToast('✓ Profil berhasil diperbarui', 'success');
      setProfile((p) => p ? { ...p, fullname: String(fd.get('fullname')), phone: String(fd.get('phone')) } : null);
    }
    setSaving(false);
  }

  async function handleSetup2FA() {
    setTwoFALoading(true);
    setSetupMode(true);
    const res = await generateBackupCodes();
    if ('codes' in res && res.codes) {
      setBackupCodes(res.codes);
    }
    setTwoFALoading(false);
  }

  async function handleConfirmEnable() {
    setTwoFALoading(true);
    const res = await toggleTwoFactor(true);
    if ('error' in res) {
      showToast('Gagal: ' + res.error, 'error');
    } else {
      setTwoFAEnabled(true);
      setSetupMode(false);
      showToast('✓ 2FA berhasil diaktifkan', 'success');
    }
    setTwoFALoading(false);
  }

  async function handleDisable2FA() {
    if (!confirm('Yakin ingin menonaktifkan 2FA? Akun kamu akan kurang aman.')) return;
    setTwoFALoading(true);
    const res = await toggleTwoFactor(false);
    if ('error' in res) {
      showToast('Gagal: ' + res.error, 'error');
    } else {
      setTwoFAEnabled(false);
      setBackupCodes([]);
      showToast('✓ 2FA dinonaktifkan', 'success');
    }
    setTwoFALoading(false);
  }

  async function handleRegenerateCodes() {
    setTwoFALoading(true);
    const res = await generateBackupCodes();
    if ('codes' in res && res.codes) {
      setBackupCodes(res.codes);
      showToast('✓ Backup codes baru di-generate', 'success');
    }
    setTwoFALoading(false);
  }

  async function handleLogoutAll() {
    if (!confirm('Yakin ingin logout dari semua device? Kamu harus login ulang.')) return;
    const res = await logoutAllDevices();
    if ('error' in res) {
      showToast('Gagal: ' + res.error, 'error');
    } else {
      showToast('✓ Logout dari semua device berhasil', 'success');
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    showToast('✓ Backup codes tersalin ke clipboard', 'success');
  }

  if (loading) return <div className="card"><p>Loading profile...</p></div>;
  if (!profile) return <div className="card"><p>Profile tidak ditemukan</p></div>;

  // Warna untuk security card (warning / orange-red)
  const securityCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(255, 159, 64, 0.08), rgba(239, 68, 68, 0.05))',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  };

  const subCardStyle: React.CSSProperties = {
    background: 'rgba(239, 68, 68, 0.04)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '12px',
    padding: '16px',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* === Profile Form === */}
      <div className="card">
        <h3 className="text-lg font-bold mb-5">👤 Informasi Profil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
              <input name="fullname" defaultValue={profile.fullname} className="input" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input defaultValue={profile.email} disabled className="input" />
            </div>
            <div className="mb-5">
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nomor HP</label>
              <input name="phone" defaultValue={profile.phone} className="input" />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '⏳ Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          <div className="rounded-2xl p-6 text-white" style={{ background: 'var(--gradient)' }}>
            <h3 className="font-bold mb-5">Info Akun</h3>
            <p className="mb-2 opacity-90"><strong>Role:</strong> {profile.role === 'admin' ? '👑 Admin' : '👤 Customer'}</p>
            <p className="mb-2 opacity-90"><strong>Member sejak:</strong> {fmtDate(profile.created_at)}</p>
            <p className="opacity-90"><strong>User ID:</strong> {profile.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* === Security Section === */}
      <div className="card" style={securityCardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold" style={{ color: '#ef4444' }}>🔐 Keamanan Akun</h3>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Kelola autentikasi, sesi aktif, dan riwayat login untuk menjaga akun kamu tetap aman.
        </p>

        {/* === 2FA Block === */}
        <div style={subCardStyle} className="mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold">Two-Factor Authentication (2FA)</h4>
                {twoFAEnabled && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                    ✓ Aktif
                  </span>
                )}
                {!twoFAEnabled && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Tambahkan lapisan keamanan ekstra dengan Google Authenticator
              </p>
            </div>

            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFAEnabled || setupMode}
                disabled={twoFALoading}
                onChange={(e) => {
                  if (e.target.checked && !twoFAEnabled) handleSetup2FA();
                  else if (!e.target.checked && twoFAEnabled) handleDisable2FA();
                  else if (!e.target.checked && setupMode) setSetupMode(false);
                }}
              />
              <div
                className="w-11 h-6 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  background: (twoFAEnabled || setupMode) ? '#22c55e' : 'rgba(148, 163, 184, 0.4)',
                }}
              />
            </label>
          </div>

          {/* Setup mode — show QR + backup codes, await confirm */}
          {setupMode && !twoFAEnabled && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm font-bold mb-2">1. Scan with Google Authenticator</p>
                  <div
                    className="rounded-lg flex items-center justify-center"
                    style={{
                      width: '180px',
                      height: '180px',
                      background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 12px 12px',
                      border: '4px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <span style={{ background: '#fff', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold' }}>
                      QR PLACEHOLDER
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Atau masukkan kode manual: <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>JBSWY3DPEHPK3PXP</code>
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold mb-2">2. Simpan Backup Codes</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    Simpan kode ini di tempat aman. Gunakan jika kehilangan akses authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {backupCodes.map((code, i) => (
                      <code
                        key={i}
                        style={{
                          background: 'rgba(0,0,0,0.05)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                        }}
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <button onClick={copyBackupCodes} className="btn btn-secondary text-xs">
                    📋 Copy Codes
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleConfirmEnable}
                  disabled={twoFALoading}
                  className="btn btn-primary"
                  style={{ background: '#22c55e' }}
                >
                  {twoFALoading ? '⏳ Memproses...' : '✓ Konfirmasi & Aktifkan'}
                </button>
                <button
                  onClick={() => { setSetupMode(false); setBackupCodes([]); }}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Enabled state — show backup codes (regenerated) + disable button */}
          {twoFAEnabled && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(239, 68, 68, 0.15)' }}>
              {backupCodes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold mb-2">Backup Codes</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
                    {backupCodes.map((code, i) => (
                      <code
                        key={i}
                        style={{
                          background: 'rgba(0,0,0,0.05)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                        }}
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleRegenerateCodes}
                  disabled={twoFALoading}
                  className="btn btn-secondary"
                >
                  🔄 Regenerate Backup Codes
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={twoFALoading}
                  className="btn"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  {twoFALoading ? '⏳ Memproses...' : '🚫 Disable 2FA'}
                </button>
              </div>
            </div>
          )}

          {/* Disabled state — Setup button (only when not in setup mode) */}
          {!twoFAEnabled && !setupMode && (
            <div className="mt-4">
              <button
                onClick={handleSetup2FA}
                disabled={twoFALoading}
                className="btn btn-primary"
                style={{ background: '#ef4444' }}
              >
                {twoFALoading ? '⏳ Memproses...' : '🔐 Setup 2FA'}
              </button>
            </div>
          )}
        </div>

        {/* === Sesi Aktif === */}
        <div style={subCardStyle} className="mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h4 className="font-bold">💻 Sesi Aktif</h4>
            <button onClick={handleLogoutAll} className="btn btn-secondary text-xs">
              🚪 Logout semua device
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {activeSessions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg flex-wrap gap-2"
                style={{ background: 'rgba(0,0,0,0.03)' }}
              >
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {s.device}
                    {s.current && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                        Device saat ini
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    📍 {s.location} • ⏱ {s.lastActive}
                  </p>
                </div>
                {!s.current && (
                  <button className="btn btn-secondary text-xs">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === Riwayat Login === */}
        <div style={subCardStyle}>
          <h4 className="font-bold mb-3">📜 Riwayat Login (5 terakhir)</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <th className="text-left py-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>Waktu</th>
                  <th className="text-left py-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>IP Address</th>
                  <th className="text-left py-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>Device</th>
                  <th className="text-left py-2 px-2 text-xs" style={{ color: 'var(--text-muted)' }}>Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td className="py-2 px-2 text-xs">{l.timestamp}</td>
                    <td className="py-2 px-2 text-xs"><code>{l.ip}</code></td>
                    <td className="py-2 px-2 text-xs">{l.device}</td>
                    <td className="py-2 px-2 text-xs">{l.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
