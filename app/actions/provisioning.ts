'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { provisionHosting, type ProvisioningRecord } from '@/lib/provisioning';

export async function getProvisionedServices(userId?: string): Promise<ProvisioningRecord[]> {
  const supabase = createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const { data } = await supabase
    .from('provisioning_queue')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  return (data || []) as ProvisioningRecord[];
}

export async function activateOrder(orderId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  // Ambil detail order untuk tahu tipe & nama service
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, user_id, name, type, period')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return { error: 'Order tidak ditemukan' };

  // Domain tidak butuh provisioning hosting account
  if (order.type === 'domain') {
    return { skipped: true, reason: 'Domain order tidak butuh hosting provisioning' };
  }

  // Cegah duplicate provisioning
  const { data: existing } = await supabase
    .from('provisioning_queue')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (existing) {
    return { success: true, provisioningId: existing.id, alreadyProvisioned: true };
  }

  const { data, error } = await provisionHosting(
    order.user_id,
    order.id,
    order.type,
    order.name
  );

  if (error || !data) return { error: error || 'Gagal provisioning' };

  // Log activity provisioning sukses
  await supabase.from('activity_log').insert({
    user_id: order.user_id,
    icon: '⚡',
    action: 'Hosting account aktif',
    description: `${order.name} - ${data.subdomain}`,
    color: 'success',
  });
  await supabase.from('notifications').insert({
    user_id: order.user_id,
    icon: '🚀',
    title: 'Hosting Anda sudah aktif!',
    description: `Subdomain: ${data.subdomain} - cek detail credentials di dashboard`,
    is_read: false,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/hosting');
  return { success: true, provisioningId: data.id };
}

export async function suspendService(provisioningId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  // Admin only check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Hanya admin yang bisa suspend service' };
  }

  const { data: target } = await supabase
    .from('provisioning_queue')
    .select('user_id, service_name')
    .eq('id', provisioningId)
    .single();

  if (!target) return { error: 'Service tidak ditemukan' };

  const { error } = await supabase
    .from('provisioning_queue')
    .update({ status: 'suspended' })
    .eq('id', provisioningId);

  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    user_id: target.user_id,
    icon: '⛔',
    action: 'Service disuspend',
    description: `${target.service_name} dinonaktifkan sementara oleh admin`,
    color: 'danger',
  });
  await supabase.from('notifications').insert({
    user_id: target.user_id,
    icon: '⚠️',
    title: 'Service disuspend',
    description: `${target.service_name} telah dinonaktifkan. Hubungi support.`,
    is_read: false,
  });

  revalidatePath('/dashboard/hosting');
  return { success: true };
}

export async function getProvisioningById(provisioningId: number): Promise<ProvisioningRecord | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('provisioning_queue')
    .select('*')
    .eq('id', provisioningId)
    .eq('user_id', user.id)
    .single();

  return (data as ProvisioningRecord) || null;
}
