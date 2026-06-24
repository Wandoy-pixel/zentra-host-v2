'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// === Two-Factor Authentication ===
// NOTE: This is a UI showcase — actual TOTP verification is not implemented yet.
// For now we only toggle `two_factor_enabled` di tabel user_settings.

export async function toggleTwoFactor(enabled: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  // Upsert ke user_settings — kalau row belum ada, insert; kalau ada, update.
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        two_factor_enabled: enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) return { error: error.message };

  // Catat ke activity log
  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🔐',
    action: enabled ? '2FA diaktifkan' : '2FA dinonaktifkan',
    description: enabled
      ? 'Two-Factor Authentication berhasil diaktifkan'
      : 'Two-Factor Authentication berhasil dinonaktifkan',
    color: enabled ? 'success' : 'warning',
  });

  revalidatePath('/dashboard/profile');
  return { ok: true, enabled };
}

export async function getTwoFactorStatus() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { enabled: false };

  const { data } = await supabase
    .from('user_settings')
    .select('two_factor_enabled')
    .eq('user_id', user.id)
    .maybeSingle();

  return { enabled: !!data?.two_factor_enabled };
}

// Generate 8 backup codes (UI showcase — bukan real TOTP)
export async function generateBackupCodes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Array.from({ length: 4 }, () =>
      Math.random().toString(36).slice(2, 6).toUpperCase()
    ).join('-').slice(0, 19);
    codes.push(code);
  }

  return { ok: true, codes };
}

// Simulate logout dari semua device (placeholder)
export async function logoutAllDevices() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login dulu' };

  await supabase.from('activity_log').insert({
    user_id: user.id,
    icon: '🚪',
    action: 'Logout semua device',
    description: 'User logout dari semua sesi aktif',
    color: 'warning',
  });

  return { ok: true };
}
