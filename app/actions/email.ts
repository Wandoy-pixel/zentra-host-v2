'use server';

/**
 * Email server actions — trigger pengiriman email Resend
 * berdasarkan data di Supabase.
 */

import { createClient } from '@/lib/supabase/server';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import {
  welcomeEmail,
  invoiceEmail,
  activationEmail,
  type InvoiceItem,
  type ActivationCredentials,
} from '@/lib/email-templates';

type ActionResult = { success: boolean; id?: string | null; error?: string };

/**
 * Kirim welcome email ke user setelah register.
 */
export async function sendWelcomeEmail(userId: string): Promise<ActionResult> {
  if (!isResendConfigured()) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient();

  // Ambil email dari auth.users (lewat admin? — kita pakai getUser kalau user yg login,
  // atau lookup via profiles + auth via service role. Untuk simplicity:
  // ambil email user yang sedang login kalau userId match, fallback ke profiles.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let email: string | null = null;
  let name = 'Sobat Zentra';

  if (user && user.id === userId) {
    email = user.email || null;
    name =
      (user.user_metadata?.fullname as string) ||
      (user.user_metadata?.full_name as string) ||
      (user.email ? user.email.split('@')[0] : 'Sobat Zentra');
  }

  // Fallback: cari di profiles
  if (!email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('fullname')
      .eq('id', userId)
      .single();
    if (profile?.fullname) name = profile.fullname;
    // Tanpa service role, kita gak bisa ambil email dari auth.users.
    // Caller harus pastikan user login saat trigger ini.
  }

  if (!email) {
    return { success: false, error: 'Email user tidak ditemukan' };
  }

  const html = welcomeEmail(name);
  const result = await sendEmail({
    to: email,
    subject: `Selamat datang di Zentra Host, ${name}!`,
    html,
    template: 'welcome',
    userId,
  });

  if (result.error) return { success: false, error: result.error };
  return { success: true, id: result.id };
}

/**
 * Kirim invoice email berdasarkan order ID.
 */
export async function sendInvoiceEmail(userId: string, orderId: number): Promise<ActionResult> {
  if (!isResendConfigured()) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (orderErr || !order) {
    return { success: false, error: 'Order tidak ditemukan' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.id === userId ? user.email : null;
  const name =
    (user?.user_metadata?.fullname as string) ||
    (user?.email ? user.email.split('@')[0] : 'Customer');

  if (!email) {
    return { success: false, error: 'Email user tidak ditemukan' };
  }

  const invoiceNo = 'INV-' + String(order.id).padStart(6, '0');
  const items: InvoiceItem[] = [
    {
      name: `${order.name} (${order.type}) - ${order.period} bulan`,
      qty: 1,
      price: order.price,
    },
  ];

  const html = invoiceEmail(name, invoiceNo, items, order.price);
  const result = await sendEmail({
    to: email,
    subject: `Invoice ${invoiceNo} - Zentra Host`,
    html,
    template: 'invoice',
    userId,
  });

  if (result.error) return { success: false, error: result.error };
  return { success: true, id: result.id };
}

/**
 * Kirim activation email berdasarkan provisioning queue ID.
 */
export async function sendActivationEmail(
  userId: string,
  queueId: number
): Promise<ActionResult> {
  if (!isResendConfigured()) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const supabase = createClient();

  // Coba ambil dari provisioning_queue, fallback ke orders
  const { data: queue } = await supabase
    .from('provisioning_queue')
    .select('*')
    .eq('id', queueId)
    .eq('user_id', userId)
    .single();

  let serviceName = 'Layanan';
  let credentials: ActivationCredentials = {};

  if (queue) {
    serviceName = queue.service_name || queue.name || 'Layanan';
    credentials = {
      username: queue.username,
      password: queue.password,
      host: queue.host || queue.server,
      port: queue.port,
      ipAddress: queue.ip_address,
      cpanelUrl: queue.cpanel_url || queue.panel_url,
    };
  } else {
    // Fallback ke orders
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', queueId)
      .eq('user_id', userId)
      .single();
    if (!order) {
      return { success: false, error: 'Data provisioning tidak ditemukan' };
    }
    serviceName = `${order.name} (${order.type})`;
    credentials = {
      username: 'akan dikirim terpisah',
      host: 'akan dikirim terpisah',
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.id === userId ? user.email : null;
  const name =
    (user?.user_metadata?.fullname as string) ||
    (user?.email ? user.email.split('@')[0] : 'Customer');

  if (!email) {
    return { success: false, error: 'Email user tidak ditemukan' };
  }

  const html = activationEmail(name, serviceName, credentials);
  const result = await sendEmail({
    to: email,
    subject: `${serviceName} aktif - Zentra Host`,
    html,
    template: 'activation',
    userId,
  });

  if (result.error) return { success: false, error: result.error };
  return { success: true, id: result.id };
}
