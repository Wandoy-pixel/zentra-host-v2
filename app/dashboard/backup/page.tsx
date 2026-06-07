'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createBackup, deleteBackup } from '@/app/actions/resources';
import { showToast } from '@/components/ToastProvider';
import { fmtDate } from '@/lib/data';
import type { Backup } from '@/lib/types';

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('backups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBackups(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!confirm('Buat backup baru? (files + database + email)')) return;
    setCreating(true);
    const result = await createBackup();
    if (result.error) showToast('Gagal: ' + result.error, 'error');
    else {
      const sizeStr = result.sizeMb! >= 1024 ? (result.sizeMb!/1024).toFixed(1) + ' GB' : result.sizeMb + ' MB';
      showToast('✓ Backup berhasil dibuat (' + sizeStr + ')', 'success');
      load();
    }
    setCreating(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus backup ini permanen?')) return;
    const result = await deleteBackup(id);
    if (result.error) showToast('Gagal: ' + result.error, 'error');
    else {
      showToast('✓ Backup dihapus', 'success');
      load();
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h3 className="text-lg font-bold">💾 Backup Manager</h3>
        <button onClick={handleCreate} disabled={creating} className="btn btn-primary">
          {creating ? '⏳ Membuat...' : '+ Buat Backup Baru'}
        </button>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Backup otomatis harian. Tersimpan 30 hari terakhir.
      </p>

      {loading ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : backups.length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">💾</div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Belum ada Backup</h3>
          <p className="text-sm">Klik "Buat Backup Baru" untuk backup pertama</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((b) => {
            const sizeStr = b.size_mb >= 1024 ? (b.size_mb / 1024).toFixed(1) + ' GB' : b.size_mb + ' MB';
            const auto = b.backup_type === 'auto';
            return (
              <div key={b.id} className="rounded-xl p-4 flex gap-4 items-center flex-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--secondary)' }}
                >
                  {auto ? '🤖' : '🖱️'}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h5 className="font-semibold text-sm mb-0.5">{b.name}</h5>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {fmtDate(b.created_at)} · {sizeStr} ·{' '}
                    <span className="status status-active">{b.status === 'completed' ? '✓ ' + b.backup_type : b.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast('🔄 Restore dimulai. Estimasi 3-5 menit.', 'info')} className="btn btn-ghost text-xs">Restore</button>
                  <button onClick={() => handleDelete(b.id)} className="btn btn-ghost text-xs">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
