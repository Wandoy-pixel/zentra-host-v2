'use client';

import Link from 'next/link';
import { useState } from 'react';
import { register } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ToastProvider';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await register(formData);
    if (result?.error) setError(result.error);
    else if (result?.success) setSuccess(result.success);
    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback?next=/dashboard' },
    });
    if (error) showToast('Google OAuth: ' + error.message, 'error');
  }

  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div
        className="w-full max-w-md rounded-3xl p-10"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold text-xl">
            <span
              className="w-8 h-8 rounded-lg grid place-items-center text-white"
              style={{ background: 'var(--gradient)' }}
            >
              Z
            </span>
            <span>Zentra</span>
          </Link>
        </div>

        <h1 className="text-center text-3xl font-extrabold mb-6" style={{ letterSpacing: '-1px' }}>
          Daftar
        </h1>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2.5 font-medium text-sm cursor-pointer border"
          style={{ background: 'white', color: '#1f1f1f', borderColor: '#dadce0' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.72.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Daftar dengan Google
        </button>

        <div className="flex items-center my-5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex-1 h-px mr-3" style={{ background: 'var(--border)' }} />
          atau
          <span className="flex-1 h-px ml-3" style={{ background: 'var(--border)' }} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form action={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <input type="text" name="fullname" placeholder="Nama lengkap Anda" required className="input" />
          </div>
          <div className="mb-3">
            <label className="block mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" name="email" placeholder="nama@email.com" required className="input" />
          </div>
          <div className="mb-3">
            <label className="block mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Nomor HP</label>
            <input type="tel" name="phone" placeholder="08xxxxxxxxxx" required className="input" />
          </div>
          <div className="mb-3">
            <label className="block mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input type="password" name="password" placeholder="Min. 6 karakter" minLength={6} required className="input" />
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Konfirmasi Password</label>
            <input type="password" name="confirm" placeholder="Ulangi password" minLength={6} required className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
            {loading ? '⏳ Memproses...' : 'Buat Akun'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
