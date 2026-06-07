/**
 * Resend Email Service Wrapper
 * Pakai Resend REST API langsung via fetch (tanpa SDK).
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

import { createClient } from '@/lib/supabase/server';

export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Zentra Host <noreply@zentra.id>';
// Untuk testing tanpa domain terverifikasi, set RESEND_FROM_EMAIL=onboarding@resend.dev
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  /** Template name untuk logging (welcome, invoice, activation, password_reset, support_reply) */
  template?: string;
  /** Override sender, default pakai FROM_EMAIL */
  from?: string;
  /** Reply-To address */
  replyTo?: string;
  /** Optional user_id untuk linking ke emails_log */
  userId?: string;
};

export type SendEmailResult = {
  id: string | null;
  error: string | null;
};

/**
 * Cek apakah Resend tersedia (API key sudah di-set).
 * Berguna untuk skip silent di development mode.
 */
export function isResendConfigured(): boolean {
  return Boolean(RESEND_API_KEY && RESEND_API_KEY.length > 0);
}

/**
 * Kirim email via Resend dan log hasilnya ke emails_log table.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, template, from, replyTo, userId } = params;

  // Skip silent kalau API key gak ada (development mode)
  if (!isResendConfigured()) {
    console.warn('[resend] RESEND_API_KEY tidak di-set, skip kirim email:', subject);
    return { id: null, error: 'RESEND_API_KEY not configured' };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const sender = from || FROM_EMAIL;

  let resultId: string | null = null;
  let resultError: string | null = null;

  try {
    const body: Record<string, unknown> = {
      from: sender,
      to: recipients,
      subject,
      html,
    };
    if (replyTo) body.reply_to = replyTo;

    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      resultError =
        (json && (json.message || json.error || json.name)) || `HTTP ${res.status}`;
    } else {
      resultId = (json && json.id) || null;
    }
  } catch (err) {
    resultError = err instanceof Error ? err.message : 'Unknown send error';
  }

  // Log ke emails_log (best-effort, jangan throw kalau gagal log)
  try {
    const supabase = createClient();
    await supabase.from('emails_log').insert({
      user_id: userId || null,
      to_email: recipients.join(','),
      from_email: sender,
      subject,
      template: template || null,
      provider_id: resultId,
      status: resultError ? 'failed' : 'sent',
      error: resultError,
    });
  } catch (logErr) {
    // Silent — log table mungkin belum dibuat, jangan blok flow
    console.warn('[resend] gagal log ke emails_log:', logErr);
  }

  return { id: resultId, error: resultError };
}
