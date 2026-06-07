'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { activateOrder } from './provisioning';

type OrderPayload = {
  name: string;
  type: 'shared' | 'cloud' | 'vps' | 'domain';
  period: number;
  price: number;
  payment: string;
};

export async function createOrder(payload: OrderPayload) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      name: payload.name,
      type: payload.type,
      period: payload.period,
      price: payload.price,
      payment: payload.payment,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const invoiceNo = 'INV-' + String(data.id).padStart(6, '0');

  // Auto trigger notification + activity
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '🎉',
    title: 'Pembayaran Berhasil!',
    description: `${invoiceNo} - ${payload.name} aktif`,
    is_read: false,
  });
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🛒',
    action: '💰 Pembelian sukses',
    description: `${payload.name} (${payload.type}) - Rp ${payload.price.toLocaleString('id-ID')}`,
    color: 'success',
  });

  // Auto-provisioning real account dengan credentials
  const provisionResult = await activateOrder(data.id);

  revalidatePath('/dashboard');
  return {
    success: true,
    invoiceNo,
    orderId: data.id,
    provisioningId: provisionResult?.provisioningId,
  };
}

export async function getOrders() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}
