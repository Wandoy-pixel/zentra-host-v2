import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Successful session exchange — redirect to next destination
        const redirectPath = next.startsWith('/') ? next : '/dashboard';
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }

      // Supabase returned an error during code exchange
      const errorMessage = encodeURIComponent(error.message || 'oauth_exchange_failed');
      return NextResponse.redirect(
        `${origin}/login?error=${errorMessage}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'unknown_oauth_error';
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(message)}`
      );
    }
  }

  // No code provided in the callback URL
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('missing_oauth_code')}`
  );
}
