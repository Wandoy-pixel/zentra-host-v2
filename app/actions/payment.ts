'use server';

import { createClient } from '@/lib/supabase/server';
import { createSnapTransaction } from '@/lib/midtrans';

export type CreatePaymentResult =
  | { snapToken: string; redirectUrl: string; midtransOrderId: string }
  | { error: string };

/**
 * createPaymentSession
 * Generate Midtrans Snap token untuk order yang sudah ada di DB.
 */
export async function createPaymentSession(
  orderId: number | string,
  amount: number,
  name: string,
  email: string,
  phone: string
): Promise<CreatePaymentResult> {
  const supabase = createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  // 2. Verify order ownership
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (orderErr || !order) {
    return { error: 'Order tidak ditemukan atau bukan milik Anda' };
  }

  // 3. Generate unique midtrans_order_id — Midtrans melarang order_id duplikat
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const midtransOrderId = `ZTR-${orderId}-${Date.now()}${rand}`;

  // 4. Split name → first/last untuk Midtrans
  const [firstName, ...rest] = (name || 'Customer').trim().split(/\s+/);
  const lastName = rest.join(' ');

  const grossAmount = Math.round(Number(amount));

  // 5. Call Midtrans Snap
  let snap: { token: string; redirect_url: string };
  try {
    snap = await createSnapTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName || undefined,
        email,
        phone,
      },
      item_details: [
        {
          id: String(order.id),
          price: grossAmount,
          quantity: 1,
          name: String(order.name || `Order #${order.id}`).slice(0, 50),
        },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gagal membuat sesi pembayaran';
    return { error: msg };
  }

  // 6. Insert payments row — fault tolerant terhadap schema mismatch.
  // Kalau insert gagal (kolom missing, RLS, dll), kita TIDAK blokir user;
  // Snap popup tetap dimunculkan supaya user bisa bayar. Webhook nanti
  // bisa fallback ke orders table via midtrans_order_id kalau perlu.
  try {
    const { error: payErr } = await supabase.from('payments').insert({
      order_id: order.id,
      user_id: user.id,
      midtrans_order_id: midtransOrderId,
      gross_amount: grossAmount,
      snap_token: snap.token,
      redirect_url: snap.redirect_url,
      status: 'pending',
    });

    if (payErr) {
      console.warn(
        '[payment] insert payments failed, continue:',
        payErr.message
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('[payment] insert payments threw, continue:', msg);
  }

  // SELALU return snapToken biar Snap popup tetap muncul
  return {
    snapToken: snap.token,
    redirectUrl: snap.redirect_url,
    midtransOrderId,
  };
}
