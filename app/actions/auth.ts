'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendWelcomeEmail } from '@/app/actions/email';
import { isResendConfigured } from '@/lib/resend';

export async function login(formData: FormData) {
  const email = String(formData.get('email')).trim().toLowerCase();
  const password = String(formData.get('password'));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateError(error.message) };
  }
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const fullname = String(formData.get('fullname')).trim();
  const email = String(formData.get('email')).trim().toLowerCase();
  const phone = String(formData.get('phone')).trim();
  const password = String(formData.get('password'));
  const confirm = String(formData.get('confirm'));

  if (password !== confirm) return { error: 'Password dan konfirmasi tidak sama' };
  if (password.length < 6) return { error: 'Password minimal 6 karakter' };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullname, phone } },
  });

  if (error) return { error: translateError(error.message) };

  // Create welcome notification + activity
  if (data.session && data.user) {
    await supabase.from('notifications').insert({
      user_id: data.user.id,
      icon: '🎉',
      title: 'Selamat datang di Zentra Host!',
      description: 'Akun kamu aktif. Yuk eksplor dashboard kamu.',
      is_read: false,
    });
    await supabase.from('activity_log').insert({
      user_id: data.user.id,
      icon: '✅',
      action: 'Akun didaftarkan',
      description: 'Email: ' + email,
      color: 'success',
    });

    // Kirim welcome email (skip silent kalau RESEND_API_KEY gak ada)
    if (isResendConfigured()) {
      try {
        await sendWelcomeEmail(data.user.id);
      } catch (e) {
        // Jangan blok register flow kalau email gagal kirim
        console.warn('[auth] gagal kirim welcome email:', e);
      }
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  return { success: 'Akun berhasil dibuat! Silakan login.' };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

function translateError(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return 'Email atau password salah';
  if (/User already registered|already.*registered/i.test(msg)) return 'Email sudah terdaftar';
  if (/Password should be at least 6 characters/i.test(msg)) return 'Password minimal 6 karakter';
  if (/Email not confirmed/i.test(msg)) return 'Email belum diverifikasi';
  return 'Terjadi kesalahan: ' + msg;
}
