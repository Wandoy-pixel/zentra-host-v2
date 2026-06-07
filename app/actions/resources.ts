'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// === DNS Records ===
export async function addDnsRecord(payload: {
  domain: string;
  record_type: string;
  name: string;
  value: string;
  ttl: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('dns_records').insert({
    user_id: user.id,
    ...payload,
  });
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🌍',
    action: 'DNS Record ditambah',
    description: `${payload.record_type} ${payload.name} → ${payload.value}`,
    color: 'success',
  });
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '🌍',
    title: 'DNS Record Baru',
    description: `${payload.record_type} record untuk ${payload.name} berhasil dibuat`,
    is_read: false,
  });
  revalidatePath('/dashboard/dns');
  return { success: true };
}

export async function deleteDnsRecord(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('dns_records').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🗑️',
    action: 'DNS Record dihapus',
    description: 'Record ID ' + id,
    color: 'danger',
  });
  revalidatePath('/dashboard/dns');
  return { success: true };
}

// === Backups ===
export async function createBackup() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const name = 'Backup ' + new Date().toLocaleString('id-ID');
  const sizeMb = Math.floor(Math.random() * 2000) + 500;
  const { error } = await supabase.from('backups').insert({
    user_id: user.id,
    name,
    backup_type: 'manual',
    size_mb: sizeMb,
    status: 'completed',
  });
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '💾',
    action: 'Backup dibuat',
    description: name,
    color: 'success',
  });
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '💾',
    title: 'Backup Selesai',
    description: name + ' siap di-restore kapan saja',
    is_read: false,
  });
  revalidatePath('/dashboard/backup');
  return { success: true, sizeMb };
}

export async function deleteBackup(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('backups').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/backup');
  return { success: true };
}

// === Subdomains ===
export async function addSubdomain(subdomain: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  if (!/^[a-z0-9-]+$/.test(subdomain)) return { error: 'Subdomain hanya huruf, angka, strip' };

  const { error } = await supabase.from('subdomains').insert({
    user_id: user.id,
    subdomain: subdomain.toLowerCase(),
    target: 'public_html/' + subdomain,
  });
  if (error) {
    if (error.code === '23505') return { error: 'Subdomain sudah ada' };
    return { error: error.message };
  }
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🔗',
    action: 'Subdomain dibuat',
    description: subdomain + '.zentrahost.com',
    color: 'success',
  });
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

export async function deleteSubdomain(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('subdomains').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

// === Email Accounts ===
export async function addEmailAccount(prefix: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  if (!/^[a-z0-9._-]+$/.test(prefix)) return { error: 'Format email tidak valid' };
  const full = prefix + '@zentrahost.com';
  const { error } = await supabase.from('email_accounts').insert({
    user_id: user.id,
    email_address: full,
    quota_mb: 250,
  });
  if (error) {
    if (error.code === '23505') return { error: 'Email sudah ada' };
    return { error: error.message };
  }
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '📧',
    action: 'Email account dibuat',
    description: full,
    color: 'success',
  });
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

export async function deleteEmailAccount(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('email_accounts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

// === MySQL Databases ===
export async function addDatabase(dbName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  if (!/^[a-z0-9_]+$/.test(dbName)) return { error: 'Nama hanya huruf, angka, underscore' };
  const dbUser = (user.email || 'user').split('@')[0] + '_' + dbName.slice(0, 8);
  const { error } = await supabase.from('user_databases').insert({
    user_id: user.id,
    database_name: dbName,
    db_user: dbUser,
  });
  if (error) {
    if (error.code === '23505') return { error: 'Database sudah ada' };
    return { error: error.message };
  }
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🗄️',
    action: 'Database MySQL dibuat',
    description: dbName + ' (user: ' + dbUser + ')',
    color: 'success',
  });
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

export async function deleteDatabase(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const { error } = await supabase.from('user_databases').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/cpanel');
  return { success: true };
}

// === Profile Update ===
export async function updateProfile(fullname: string, phone: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };
  if (!fullname.trim()) return { error: 'Nama tidak boleh kosong' };

  const { error } = await supabase
    .from('profiles')
    .update({ fullname: fullname.trim(), phone: phone.trim() })
    .eq('id', user.id);
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '👤',
    action: 'Profil diperbarui',
    description: 'Nama: ' + fullname,
    color: 'purple',
  });
  await supabase.from('notifications').insert({
    user_id: user.id,
    icon: '👤',
    title: 'Profil Diupdate',
    description: 'Informasi akun berhasil diperbarui',
    is_read: false,
  });
  revalidatePath('/dashboard/profile');
  return { success: true };
}

// === Notifications ===
export async function markNotifRead(id: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/dashboard');
}

export async function markAllNotifsRead() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  revalidatePath('/dashboard');
}

// === Contact Form ===
// Simple in-memory rate limit (per-process). For production, replace with
// a persistent store (Upstash, Redis, atau tabel rate_limit di Supabase).
const contactRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 jam
const RATE_LIMIT_MAX = 5; // max 5 pesan / jam / email

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
}) {
  // Honeypot: bot biasanya mengisi field tersembunyi
  if (payload.honeypot && payload.honeypot.trim() !== '') {
    return { success: true as const }; // pura-pura sukses biar bot tidak retry
  }

  // Validasi input
  const name = payload.name?.trim() || '';
  const email = payload.email?.trim().toLowerCase() || '';
  const subject = payload.subject?.trim() || '';
  const message = payload.message?.trim() || '';

  if (name.length < 2 || name.length > 100) {
    return { error: 'Nama harus 2-100 karakter' };
  }
  if (!isValidEmail(email) || email.length > 200) {
    return { error: 'Format email tidak valid' };
  }
  if (subject.length < 2 || subject.length > 200) {
    return { error: 'Subjek harus 2-200 karakter' };
  }
  if (message.length < 10 || message.length > 5000) {
    return { error: 'Pesan harus 10-5000 karakter' };
  }

  // Rate limit per-email
  const now = Date.now();
  const hits = (contactRateLimit.get(email) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (hits.length >= RATE_LIMIT_MAX) {
    return { error: 'Terlalu banyak pesan. Coba lagi nanti.' };
  }
  hits.push(now);
  contactRateLimit.set(email, hits);

  const supabase = createClient();
  const { error } = await supabase.from('messages').insert({
    name,
    email,
    subject,
    message,
  });
  if (error) return { error: error.message };
  return { success: true as const };
}
