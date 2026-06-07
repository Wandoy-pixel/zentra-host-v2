'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/app/actions/resources';
import { showToast } from '@/components/ToastProvider';
import { fmtDate } from '@/lib/data';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{ fullname: string; phone: string; role: string; created_at: string; email: string; id: string } | null>(null);

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

  if (loading) return <div className="card"><p>Loading profile...</p></div>;
  if (!profile) return <div className="card"><p>Profile tidak ditemukan</p></div>;

  return (
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
  );
}
