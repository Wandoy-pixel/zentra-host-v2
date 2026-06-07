'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addSubdomain, deleteSubdomain, addEmailAccount, deleteEmailAccount, addDatabase, deleteDatabase } from '@/app/actions/resources';
import { showToast } from '@/components/ToastProvider';
import type { Subdomain, EmailAccount, UserDatabase } from '@/lib/types';

type Tab = 'subdomain' | 'email' | 'database';

export default function CpanelPage() {
  const [tab, setTab] = useState<Tab>('subdomain');
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [emails, setEmails] = useState<EmailAccount[]>([]);
  const [databases, setDatabases] = useState<UserDatabase[]>([]);
  const [input, setInput] = useState('');

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [s, e, d] = await Promise.all([
      supabase.from('subdomains').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('email_accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('user_databases').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setSubdomains(s.data || []);
    setEmails(e.data || []);
    setDatabases(d.data || []);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!input.trim()) return;
    let result;
    if (tab === 'subdomain') result = await addSubdomain(input);
    else if (tab === 'email') result = await addEmailAccount(input);
    else result = await addDatabase(input);

    if (result.error) showToast('Gagal: ' + result.error, 'error');
    else {
      showToast(`✓ ${tab === 'subdomain' ? 'Subdomain' : tab === 'email' ? 'Email' : 'Database'} berhasil dibuat`, 'success');
      setInput('');
      load();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus item ini permanen?')) return;
    let result;
    if (tab === 'subdomain') result = await deleteSubdomain(id);
    else if (tab === 'email') result = await deleteEmailAccount(id);
    else result = await deleteDatabase(id);

    if (result.error) showToast('Gagal: ' + result.error, 'error');
    else { showToast('✓ Dihapus', 'success'); load(); }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-5">🛠️ cPanel Control Panel</h3>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'subdomain', label: '🔗 Subdomain', count: subdomains.length },
          { id: 'email', label: '📧 Email', count: emails.length },
          { id: 'database', label: '🗄️ Database', count: databases.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as Tab); setInput(''); }}
            className="px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer border-0"
            style={
              tab === t.id
                ? { background: 'var(--gradient)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }
            }
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="mb-5 flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tab === 'subdomain' ? 'nama (akan jadi nama.zentrahost.com)' : tab === 'email' ? 'prefix (akan jadi prefix@zentrahost.com)' : 'nama_database'}
          className="input flex-1 min-w-[200px]"
        />
        <button onClick={handleAdd} className="btn btn-primary">+ Tambah</button>
      </div>

      <div className="space-y-2">
        {tab === 'subdomain' && subdomains.map((s) => (
          <div key={s.id} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <strong>{s.subdomain}.zentrahost.com</strong>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>→ {s.target}</p>
            </div>
            <button onClick={() => handleDelete(s.id)} className="btn btn-ghost text-xs">🗑️</button>
          </div>
        ))}
        {tab === 'email' && emails.map((em) => (
          <div key={em.id} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <strong>{em.email_address}</strong>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Quota: {em.quota_mb} MB</p>
            </div>
            <button onClick={() => handleDelete(em.id)} className="btn btn-ghost text-xs">🗑️</button>
          </div>
        ))}
        {tab === 'database' && databases.map((d) => (
          <div key={d.id} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <strong>{d.database_name}</strong>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>User: {d.db_user}</p>
            </div>
            <button onClick={() => handleDelete(d.id)} className="btn btn-ghost text-xs">🗑️</button>
          </div>
        ))}
        {((tab === 'subdomain' && subdomains.length === 0) || (tab === 'email' && emails.length === 0) || (tab === 'database' && databases.length === 0)) && (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <p>Belum ada {tab}. Tambah yang pertama!</p>
          </div>
        )}
      </div>
    </div>
  );
}
