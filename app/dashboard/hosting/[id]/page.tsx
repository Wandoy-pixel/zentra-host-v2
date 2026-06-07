import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/data';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { ProvisioningRecord } from '@/lib/provisioning';
import HostingDetailClient from './HostingDetailClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Detail Hosting',
  description: 'Detail credentials hosting account Anda.',
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: 'Aktif', cls: 'status-active' },
  pending: { text: 'Pending', cls: 'status-pending' },
  suspended: { text: 'Suspended', cls: 'status-danger' },
  failed: { text: 'Gagal', cls: 'status-danger' },
};

export default async function HostingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const { data } = await supabase
    .from('provisioning_queue')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!data) notFound();

  const svc = data as ProvisioningRecord;
  const status = STATUS_LABEL[svc.status] || STATUS_LABEL.pending;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/hosting" className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ← Hosting Saya
              </Link>
            </div>
            <h2 className="text-2xl font-bold mb-1">{svc.service_name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`status ${status.cls}`}>{status.text}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {svc.service_type.toUpperCase()}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                · Berlaku sampai {svc.expires_at ? fmtDate(svc.expires_at) : '-'}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/cpanel" className="btn btn-primary">
              🎛️ Kelola via cPanel
            </Link>
          </div>
        </div>
      </div>

      {/* Client-side interactive credentials */}
      <HostingDetailClient
        provisioningId={svc.id}
        subdomain={svc.subdomain}
        ftp={{
          host: svc.ftp_host,
          port: svc.ftp_port,
          username: svc.ftp_username,
          password: svc.ftp_password,
        }}
        mysql={{
          host: svc.mysql_host,
          database: svc.mysql_database,
          username: svc.mysql_username,
          password: svc.mysql_password,
        }}
        activatedAt={svc.activated_at}
        expiresAt={svc.expires_at}
      />
    </div>
  );
}
