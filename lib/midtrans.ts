import crypto from 'crypto';

// ============================================================
// Midtrans Snap Client (direct fetch — no SDK dependency)
// ============================================================

export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
export const MIDTRANS_IS_PRODUCTION =
  process.env.MIDTRANS_IS_PRODUCTION === 'true';

const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type SnapTransactionDetails = {
  order_id: string;
  gross_amount: number;
};

export type SnapCustomerDetails = {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
};

export type SnapItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type SnapPayload = {
  transaction_details: SnapTransactionDetails;
  customer_details: SnapCustomerDetails;
  item_details: SnapItemDetail[];
  credit_card?: { secure: boolean };
  callbacks?: { finish?: string };
};

export type SnapResponse = {
  token: string;
  redirect_url: string;
};

export type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
  [k: string]: unknown;
};

// ------------------------------------------------------------
// createSnapTransaction — generate Snap token
// ------------------------------------------------------------

export async function createSnapTransaction(
  payload: SnapPayload
): Promise<SnapResponse> {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY belum di-set di environment');
  }

  // Midtrans expects Basic auth: base64(SERVER_KEY:)
  const authHeader =
    'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

  const body: SnapPayload = {
    ...payload,
    credit_card: payload.credit_card ?? { secure: true },
  };

  const res = await fetch(MIDTRANS_SNAP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      (data.error_messages as string[] | undefined)?.join(', ') ||
      (data.status_message as string | undefined) ||
      `Midtrans error: HTTP ${res.status}`;
    throw new Error(msg);
  }

  return {
    token: data.token as string,
    redirect_url: data.redirect_url as string,
  };
}

// ------------------------------------------------------------
// verifyNotification — verify signature_key
// signature_key = SHA512(order_id + status_code + gross_amount + SERVER_KEY)
// ------------------------------------------------------------

export function verifyNotification(notification: MidtransNotification): boolean {
  if (!MIDTRANS_SERVER_KEY) return false;
  const { order_id, status_code, gross_amount, signature_key } = notification;
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const expected = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
    .digest('hex');

  // timing-safe compare
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature_key, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
