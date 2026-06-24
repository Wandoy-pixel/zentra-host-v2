'use server';

import { createClient } from '@/lib/supabase/server';

type PromoSuccess = { discount: number; message: string };
type PromoError = { error: string };

type PromoRow = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | string;
  value: number;
  min_amount: number | null;
  max_uses: number | null;
  used_count: number | null;
  valid_until: string | null;
  active: boolean;
};

function fmtRp(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export async function validatePromoCode(
  code: string,
  amount: number
): Promise<PromoSuccess | PromoError> {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) {
    return { error: 'Kode promo wajib diisi' };
  }
  if (!amount || amount <= 0) {
    return { error: 'Jumlah transaksi tidak valid' };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('promo_codes')
    .select('id, code, type, value, min_amount, max_uses, used_count, valid_until, active')
    .eq('code', normalized)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    return { error: 'Gagal memeriksa kode promo' };
  }

  const promo = data as PromoRow | null;
  if (!promo) {
    return { error: 'Kode promo tidak ditemukan atau tidak aktif' };
  }

  // Check expiry
  if (promo.valid_until) {
    const expiry = new Date(promo.valid_until).getTime();
    if (!Number.isNaN(expiry) && expiry <= Date.now()) {
      return { error: 'Kode promo sudah kedaluwarsa' };
    }
  }

  // Check usage limit
  if (promo.max_uses != null) {
    const used = promo.used_count ?? 0;
    if (used >= promo.max_uses) {
      return { error: 'Kuota kode promo sudah habis' };
    }
  }

  // Check min amount
  if (promo.min_amount != null && amount < promo.min_amount) {
    return {
      error: `Minimum transaksi ${fmtRp(promo.min_amount)} untuk pakai kode ini`,
    };
  }

  // Compute discount
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = (amount * Number(promo.value)) / 100;
  } else if (promo.type === 'fixed') {
    discount = Number(promo.value);
  } else {
    return { error: 'Tipe kode promo tidak dikenal' };
  }

  discount = Math.min(Math.round(discount), amount);
  if (discount <= 0) {
    return { error: 'Kode promo tidak memberi potongan untuk transaksi ini' };
  }

  return {
    discount,
    message: `Kode ${promo.code} berhasil! Hemat ${fmtRp(discount)}`,
  };
}
