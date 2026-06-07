import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import {
  verifyNotification,
  type MidtransNotification,
} from '@/lib/midtrans';

// Wajib nodejs runtime — kita pakai crypto module untuk verifikasi signature
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ------------------------------------------------------------
// Supabase client — utamakan SERVICE_ROLE_KEY supaya bypass RLS
// (webhook tidak punya session user). Fallback ke ANON kalau tidak ada.
// ------------------------------------------------------------
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey) {
    return createSupabaseJsClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // Fallback — secure karena sudah verifikasi signature di atas
  const cookieStore = cookies();
  return createServerClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op di webhook
        },
      },
    }
  );
}

// ------------------------------------------------------------
// POST /api/midtrans/webhook
// ------------------------------------------------------------
export async function POST(req: Request) {
  let notif: MidtransNotification;
  try {
    notif = (await req.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 1. Verify signature
  if (!verifyNotification(notif)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  const {
    order_id: midtransOrderId,
    transaction_status,
    fraud_status,
    transaction_id,
  } = notif;

  const supabase = getServiceClient();

  // 2. Lookup payment row
  const { data: payment, error: payFetchErr } = await supabase
    .from('payments')
    .select('id, order_id, user_id, status')
    .eq('midtrans_order_id', midtransOrderId)
    .single();

  if (payFetchErr || !payment) {
    // Tetap return 200 supaya Midtrans tidak retry forever — tapi tandai
    return NextResponse.json(
      { received: true, warning: 'payment not found' },
      { status: 200 }
    );
  }

  // 3. Tentukan status final
  // settlement / capture (non-fraud) → paid
  // pending → pending
  // deny / cancel / expire / failure → failed
  let finalStatus: 'pending' | 'paid' | 'failed' = 'pending';
  const isSuccess =
    transaction_status === 'settlement' ||
    (transaction_status === 'capture' &&
      (fraud_status === 'accept' || !fraud_status));

  if (isSuccess) {
    finalStatus = 'paid';
  } else if (
    transaction_status === 'deny' ||
    transaction_status === 'cancel' ||
    transaction_status === 'expire' ||
    transaction_status === 'failure'
  ) {
    finalStatus = 'failed';
  } else if (transaction_status === 'pending') {
    finalStatus = 'pending';
  }

  // 4. Update payments
  const paidAt = isSuccess ? new Date().toISOString() : null;
  await supabase
    .from('payments')
    .update({
      status: finalStatus,
      transaction_id: transaction_id ?? null,
      midtrans_response: notif,
      paid_at: paidAt,
    })
    .eq('id', payment.id);

  // 5. Side effects kalau sukses
  if (isSuccess && payment.status !== 'paid') {
    // 5a. Update orders.status — kalau kolomnya gak ada, supabase akan return error, kita abaikan
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', payment.order_id);

    // 5b. Trigger provisioning
    await supabase.from('provisioning_queue').insert({
      order_id: payment.order_id,
      user_id: payment.user_id,
      status: 'queued',
    });

    // 5c. Trigger send invoice email
    await supabase.from('emails_log').insert({
      user_id: payment.user_id,
      order_id: payment.order_id,
      template: 'invoice',
      status: 'queued',
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
