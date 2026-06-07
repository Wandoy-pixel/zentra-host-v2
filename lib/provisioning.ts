// Provisioning service - Simulasi auto-aktivasi hosting account
// Generate credentials real-looking untuk FTP, MySQL, subdomain
import { createClient } from '@/lib/supabase/server';

export type ProvisioningRecord = {
  id: number;
  user_id: string;
  order_id: number;
  service_type: 'shared' | 'cloud' | 'vps' | 'domain';
  service_name: string;
  subdomain: string;
  ftp_host: string;
  ftp_port: number;
  ftp_username: string;
  ftp_password: string;
  ftp_password_hash: string;
  mysql_host: string;
  mysql_database: string;
  mysql_username: string;
  mysql_password: string;
  mysql_password_hash: string;
  status: 'pending' | 'active' | 'suspended' | 'failed';
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
};

// Charset constants
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*-_+=';
const ALPHANUM = ALPHA_LOWER + ALPHA_UPPER + DIGITS;
const PASSWORD_CHARS = ALPHANUM + SYMBOLS;

function randStr(len: number, charset: string): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += charset[Math.floor(Math.random() * charset.length)];
  }
  return s;
}

function randDigits(len: number): string {
  return randStr(len, DIGITS);
}

// Simple SHA-like hash simulation for display masking (NOT real crypto)
// Cukup untuk demo — production wajib pakai bcrypt server-side
function simpleHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0x1337;
  let h2 = 0x41c6ce57 ^ 0xc0ffee;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  // Bikin look-alike bcrypt format
  return '$2b$10$' + hex + randStr(22, ALPHANUM);
}

// Generate password kuat: minimal 1 huruf besar, 1 huruf kecil, 1 digit, 1 simbol
function genStrongPassword(len: number): string {
  const required = [
    ALPHA_UPPER[Math.floor(Math.random() * ALPHA_UPPER.length)],
    ALPHA_LOWER[Math.floor(Math.random() * ALPHA_LOWER.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];
  const rest = randStr(len - required.length, PASSWORD_CHARS).split('');
  const arr = [...required, ...rest];
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

// Sanitasi username dari email/fullname untuk subdomain & db prefix
function sanitizeUsername(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  return cleaned || 'user' + randDigits(4);
}

// FTP/MySQL host realistic berdasarkan tipe service
function pickFtpHost(serviceType: string): string {
  const region = ['sg', 'jkt', 'id'][Math.floor(Math.random() * 3)];
  const node = randDigits(2);
  if (serviceType === 'vps' || serviceType === 'cloud') {
    return `node-${region}${node}.zentrahost.com`;
  }
  return `ftp${node}.${region}.zentrahost.com`;
}

function pickMysqlHost(serviceType: string): string {
  const region = ['sg', 'jkt', 'id'][Math.floor(Math.random() * 3)];
  const node = randDigits(2);
  if (serviceType === 'vps' || serviceType === 'cloud') {
    return 'localhost';
  }
  return `mysql${node}.${region}.zentrahost.com`;
}

export async function provisionHosting(
  userId: string,
  orderId: number,
  serviceType: 'shared' | 'cloud' | 'vps' | 'domain',
  serviceName: string
): Promise<{ data?: ProvisioningRecord; error?: string }> {
  const supabase = createClient();

  // Ambil username basis dari profile / email user
  let baseUsername = 'user';
  const { data: profile } = await supabase
    .from('profiles')
    .select('fullname')
    .eq('id', userId)
    .single();

  if (profile?.fullname) {
    baseUsername = sanitizeUsername(profile.fullname);
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) baseUsername = sanitizeUsername(user.email.split('@')[0]);
  }

  // Generate semua credentials
  const subdomain = `${baseUsername}${randDigits(3)}.zentrahost.com`;
  const ftpUsername = 'zh_' + randStr(8, ALPHANUM);
  const ftpPassword = genStrongPassword(16);
  const mysqlDatabase = 'db_' + baseUsername + randStr(4, ALPHA_LOWER + DIGITS);
  const mysqlUsername = 'db_' + randStr(6, ALPHA_LOWER + DIGITS);
  const mysqlPassword = genStrongPassword(16);

  // Hash untuk display masking (simulasi bcrypt)
  const ftpPasswordHash = simpleHash(ftpPassword);
  const mysqlPasswordHash = simpleHash(mysqlPassword);

  // Hitung expiry dari order period
  const { data: order } = await supabase
    .from('orders')
    .select('period')
    .eq('id', orderId)
    .single();

  const period = order?.period ?? 1;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + period);

  // INSERT ke provisioning_queue
  const { data, error } = await supabase
    .from('provisioning_queue')
    .insert({
      user_id: userId,
      order_id: orderId,
      service_type: serviceType,
      service_name: serviceName,
      subdomain,
      ftp_host: pickFtpHost(serviceType),
      ftp_port: 21,
      ftp_username: ftpUsername,
      ftp_password: ftpPassword,
      ftp_password_hash: ftpPasswordHash,
      mysql_host: pickMysqlHost(serviceType),
      mysql_database: mysqlDatabase,
      mysql_username: mysqlUsername,
      mysql_password: mysqlPassword,
      mysql_password_hash: mysqlPasswordHash,
      status: 'active',
      activated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as ProvisioningRecord };
}

// Mask password untuk display: tampilkan 2 char awal + bullets + 2 char akhir
export function maskPassword(pw: string): string {
  if (!pw || pw.length < 6) return '••••••••';
  return pw.slice(0, 2) + '••••••••••' + pw.slice(-2);
}
