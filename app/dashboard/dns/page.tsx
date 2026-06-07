'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addDnsRecord, deleteDnsRecord } from '@/app/actions/resources';
import { showToast } from '@/components/ToastProvider';
import type { DnsRecord } from '@/lib/types';

export default function DnsPage() {
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('dns_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const result = await addDnsRecord({
      domain: String(fd.get('domain')),
      record_type: String(fd.get('type')),
      name: String(fd.get('name')),
      value: String(fd.get('value')),
      ttl: parseInt(String(fd.get('ttl'))) || 3600,
    });
    if ('error' in result) showToast('Gagal: ' + result.error, 'error');
    else {
      showToast('✓ DNS record berhasil ditambah', 'success');
      setShowForm(false);
      load();
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus DNS record ini?')) return;
    const result = await deleteDnsRecord(id);
    if ('error' in result) showToast('Gagal: ' + result.error, 'error');
    else {
      showToast('✓ DNS record dihapus', 'success');
      load();
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold">🌍 DNS Manager</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '✕ Batal' : '+ Add Record'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Tipe</label>
              <select name="type" required className="input">
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME (Alias)</option>
                <option value="MX">MX (Mail)</option>
                <option value="TXT">TXT (Text)</option>
                <option value="NS">NS (Name server)</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Domain</label>
              <input name="domain" defaultValue="zentrahost.com" required className="input" />
            </div>
            <div>
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nama (@, www, dll)</label>
              <input name="name" defaultValue="@" required className="input" />
            </div>
            <div>
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Value</label>
              <input name="value" placeholder="103.124.95.42" required className="input" />
            </div>
            <div>
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>TTL (detik)</label>
              <input type="number" name="ttl" defaultValue={3600} required className="input" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="btn btn-primary btn-block">
                {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">🌍</div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Belum ada DNS Record</h3>
          <p className="text-sm">Tambah record pertama untuk kelola domain kamu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="grid grid-cols-[80px_1fr_1fr_80px_100px] gap-3 items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="inline-block px-2.5 py-1 rounded text-xs font-bold text-center" style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent)' }}>
                {r.record_type}
              </span>
              <span className="font-semibold text-sm">{r.name}</span>
              <span className="text-xs break-all" style={{ color: 'var(--text-muted)' }}>{r.value}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>TTL {r.ttl}</span>
              <button onClick={() => handleDelete(r.id)} className="btn btn-ghost text-xs">🗑️ Hapus</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
