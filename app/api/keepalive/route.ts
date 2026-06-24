import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Keep-alive endpoint untuk mencegah Supabase Free Tier auto-pause.
 * Ping endpoint ini setiap 6 jam dari cron eksternal (cron-job.org / UptimeRobot)
 * supaya Supabase tetap dianggap aktif dan tidak di-pause.
 *
 * Usage:
 *   GET https://zentra-host-v2.vercel.app/api/keepalive
 *
 * Cron setup (gratis):
 *   1. Daftar https://cron-job.org
 *   2. Buat job: URL di atas, interval 6 jam
 *   3. Save → Supabase tetap aktif selamanya!
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = createClient();
    // Lightweight query — cuma cek auth.users count untuk tap database
    const { error } = await supabase.from('orders').select('id', { count: 'exact', head: true }).limit(1);
    const durationMs = Date.now() - startedAt;

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          status: 'database_error',
          error: error.message,
          durationMs,
        },
        { status: 200 } // tetap 200 supaya cron tidak retry forever
      );
    }

    return NextResponse.json({
      ok: true,
      status: 'alive',
      message: 'Supabase pinged successfully',
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        status: 'exception',
        error: e instanceof Error ? e.message : String(e),
        durationMs: Date.now() - startedAt,
      },
      { status: 200 }
    );
  }
}
