'use server';

/**
 * Support Ticket Server Actions
 * - createTicket: insert support_tickets + first message, notif, email
 * - addReply: insert support_messages, notif, email kalau perlu
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import { supportReplyEmail } from '@/lib/email-templates';

export type TicketCategory = 'billing' | 'technical' | 'sales' | 'abuse' | 'other';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

type CreateTicketResult = { error?: string; ticketId?: number; success?: boolean };

const ALLOWED_CATEGORIES: TicketCategory[] = ['billing', 'technical', 'sales', 'abuse', 'other'];
const ALLOWED_PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

/**
 * Buat tiket support baru + insert first message ke thread.
 */
export async function createTicket(
  subject: string,
  category: string,
  priority: string,
  firstMessage: string
): Promise<CreateTicketResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu untuk buat tiket' };

  // Validasi
  const cleanSubject = (subject || '').trim();
  const cleanMessage = (firstMessage || '').trim();
  const cleanCategory = (category || 'other').toLowerCase() as TicketCategory;
  const cleanPriority = (priority || 'normal').toLowerCase() as TicketPriority;

  if (!cleanSubject) return { error: 'Subject wajib diisi' };
  if (cleanSubject.length > 200) return { error: 'Subject maksimal 200 karakter' };
  if (cleanMessage.length < 10) return { error: 'Pesan minimal 10 karakter' };
  if (!ALLOWED_CATEGORIES.includes(cleanCategory)) {
    return { error: 'Kategori tidak valid' };
  }
  if (!ALLOWED_PRIORITIES.includes(cleanPriority)) {
    return { error: 'Priority tidak valid' };
  }

  // Insert ticket
  const { data: ticket, error: insertErr } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject: cleanSubject,
      category: cleanCategory,
      priority: cleanPriority,
      status: 'open',
    })
    .select()
    .single();

  if (insertErr || !ticket) {
    return { error: insertErr?.message || 'Gagal buat tiket' };
  }

  // Insert first message ke thread
  const { error: msgErr } = await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    user_id: user.id,
    author_role: 'customer',
    message: cleanMessage,
  });

  if (msgErr) {
    // Rollback tiket biar gak ada tiket tanpa message
    await supabase.from('support_tickets').delete().eq('id', ticket.id);
    return { error: msgErr.message };
  }

  const ticketNo = 'TKT-' + String(ticket.id).padStart(6, '0');

  // Trigger notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '🎫',
    title: 'Tiket berhasil dibuat',
    description: `${ticketNo} - ${cleanSubject}`,
    is_read: false,
  });

  // Activity log
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🎫',
    action: '🎫 Tiket baru dibuat',
    description: `${ticketNo} - ${cleanSubject} (${cleanCategory}/${cleanPriority})`,
    color: 'purple',
  });

  // Email konfirmasi (best-effort, kalau Resend ada)
  if (isResendConfigured() && user.email) {
    const name =
      (user.user_metadata?.fullname as string) ||
      (user.email ? user.email.split('@')[0] : 'Customer');
    const html = supportReplyEmail(
      name,
      ticketNo,
      `Tiket kamu sudah masuk ke sistem support Zentra Host.\n\nSubject: ${cleanSubject}\nKategori: ${cleanCategory}\nPriority: ${cleanPriority}\n\nTim support akan balas secepatnya. Pantau status tiket lewat dashboard.`
    );
    await sendEmail({
      to: user.email,
      subject: `Tiket ${ticketNo} dibuat - Zentra Host`,
      html,
      template: 'support_reply',
      userId: user.id,
    });
  }

  revalidatePath('/dashboard/tickets');
  return { success: true, ticketId: ticket.id };
}

/**
 * Wrapper buat dipake langsung di <form action={...}>.
 * Redirect ke detail tiket setelah berhasil dibuat.
 */
export async function createTicketForm(formData: FormData) {
  const subject = String(formData.get('subject') || '');
  const category = String(formData.get('category') || 'other');
  const priority = String(formData.get('priority') || 'normal');
  const message = String(formData.get('message') || '');

  const result = await createTicket(subject, category, priority, message);
  if (result.error || !result.ticketId) {
    // Encode error ke query string biar bisa ditampilkan
    const params = new URLSearchParams({
      error: result.error || 'Gagal buat tiket',
      subject,
      category,
      priority,
      message,
    });
    redirect(`/dashboard/tickets/new?${params.toString()}`);
  }
  redirect(`/dashboard/tickets/${result.ticketId}`);
}

type AddReplyResult = { error?: string; success?: boolean };

/**
 * Tambah reply ke thread tiket. Cek ownership (user_id match) dulu.
 */
export async function addReply(ticketId: number, message: string): Promise<AddReplyResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const cleanMessage = (message || '').trim();
  if (cleanMessage.length < 2) return { error: 'Pesan terlalu pendek' };

  // Verifikasi tiket milik user
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single();

  if (ticketErr || !ticket) {
    return { error: 'Tiket tidak ditemukan' };
  }

  if (ticket.status === 'closed') {
    return { error: 'Tiket sudah ditutup, buat tiket baru jika butuh bantuan lagi' };
  }

  // Insert reply
  const { error: msgErr } = await supabase.from('support_messages').insert({
    ticket_id: ticketId,
    user_id: user.id,
    author_role: 'customer',
    message: cleanMessage,
  });

  if (msgErr) return { error: msgErr.message };

  // Update tiket: set status ke 'open' kalau sebelumnya 'pending'/'answered',
  // dan update last activity
  await supabase
    .from('support_tickets')
    .update({
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId);

  const ticketNo = 'TKT-' + String(ticketId).padStart(6, '0');

  // Notif buat user (konfirmasi reply masuk)
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '💬',
    title: 'Reply terkirim',
    description: `${ticketNo} - Tim support akan segera membalas`,
    is_read: false,
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath('/dashboard/tickets');
  return { success: true };
}

/**
 * Wrapper untuk <form action={...}> di detail page.
 */
export async function addReplyForm(formData: FormData) {
  const ticketId = Number(formData.get('ticketId'));
  const message = String(formData.get('message') || '');

  if (!ticketId || isNaN(ticketId)) {
    redirect('/dashboard/tickets');
  }

  const result = await addReply(ticketId, message);
  if (result.error) {
    const params = new URLSearchParams({ error: result.error });
    redirect(`/dashboard/tickets/${ticketId}?${params.toString()}`);
  }
  redirect(`/dashboard/tickets/${ticketId}`);
}
