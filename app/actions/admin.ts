'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu', supabase: null, user: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Forbidden — admin only', supabase: null, user: null };
  }
  return { error: null, supabase, user };
}

export async function adminMarkOrderPaid(orderId: number) {
  const { error, supabase } = await assertAdmin();
  if (error || !supabase) return { error: error || 'Unauthorized' };

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ payment: 'manual' })
    .eq('id', orderId);
  if (updateErr) return { error: updateErr.message };

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { success: true };
}

export async function adminSuspendCustomer(userId: string) {
  const { error, supabase } = await assertAdmin();
  if (error || !supabase) return { error: error || 'Unauthorized' };

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ role: 'suspended' as any })
    .eq('id', userId);
  if (updateErr) return { error: updateErr.message };

  revalidatePath('/admin/customers');
  return { success: true };
}

export async function adminUpdateTicketStatus(
  ticketId: number,
  status: 'open' | 'pending' | 'resolved' | 'closed'
) {
  const { error, supabase } = await assertAdmin();
  if (error || !supabase) return { error: error || 'Unauthorized' };

  const { error: updateErr } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);
  if (updateErr) return { error: updateErr.message };

  revalidatePath('/admin/tickets');
  return { success: true };
}
