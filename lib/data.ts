// Static data untuk paket hosting & domain

export const PAKET_DATA = {
  shared: [
    { name: 'Starter', desc: 'Personal & landing', price: 19000, oldPrice: 50000, features: ['1 Website', '5 GB NVMe', '20 GB Bandwidth', '5 Email', 'SSL Gratis'] },
    { name: 'Business', desc: 'UKM & toko online', price: 49000, oldPrice: 120000, popular: true, features: ['10 Website', '30 GB NVMe', 'Unlimited BW', 'Email Unlimited', 'SSL + CDN', 'Daily Backup'] },
    { name: 'Pro', desc: 'High traffic site', price: 99000, oldPrice: 250000, features: ['Unlimited Site', '100 GB NVMe', 'Unlimited BW', 'Email Unlimited', 'SSL + CDN + WAF', 'Hourly Backup'] },
    { name: 'Enterprise', desc: 'Skala enterprise', price: 199000, oldPrice: 500000, features: ['Unlimited Site', '500 GB NVMe', 'Unlimited BW', 'Email Unlimited', 'Full Security', 'Real-time Backup', 'Dedicated Engineer'] }
  ],
  cloud: [
    { name: 'Cloud S', desc: 'Auto-scale ringan', price: 75000, oldPrice: 200000, features: ['2 vCPU', '2 GB RAM', '40 GB NVMe', '1 TB BW', 'Auto Scale'] },
    { name: 'Cloud M', desc: 'Aplikasi mid-scale', price: 150000, oldPrice: 400000, popular: true, features: ['4 vCPU', '4 GB RAM', '80 GB NVMe', '2 TB BW', 'Load Balancer'] },
    { name: 'Cloud L', desc: 'Production-grade', price: 280000, oldPrice: 700000, features: ['6 vCPU', '8 GB RAM', '160 GB NVMe', '4 TB BW', 'CDN + LB'] },
    { name: 'Cloud XL', desc: 'Mission-critical', price: 500000, oldPrice: 1200000, features: ['8 vCPU', '16 GB RAM', '320 GB NVMe', 'Unlimited BW', 'Full Managed'] }
  ],
  vps: [
    { name: 'VPS Lite', desc: 'Dev & staging', price: 99000, oldPrice: 250000, features: ['1 vCPU', '2 GB RAM', '40 GB SSD', '1 IPv4', 'Root Access'] },
    { name: 'VPS Standard', desc: 'Small production', price: 199000, oldPrice: 500000, popular: true, features: ['2 vCPU', '4 GB RAM', '80 GB SSD', '1 IPv4', 'Snapshot'] },
    { name: 'VPS Pro', desc: 'Production app', price: 399000, oldPrice: 900000, features: ['4 vCPU', '8 GB RAM', '160 GB SSD', '2 IPv4', 'Backup + Snapshot'] },
    { name: 'VPS Ultimate', desc: 'Heavy workload', price: 699000, oldPrice: 1500000, features: ['8 vCPU', '16 GB RAM', '320 GB SSD', '4 IPv4', 'Full Management'] }
  ],
} as const;

export const DOMAIN_PRICES = [
  { ext: '.com', price: 120000, popular: true, desc: 'Domain paling populer di dunia' },
  { ext: '.id', price: 150000, popular: true, desc: 'Domain resmi Indonesia' },
  { ext: '.co.id', price: 250000, desc: 'Untuk perusahaan/bisnis Indonesia' },
  { ext: '.net', price: 130000, desc: 'Cocok untuk situs teknologi' },
  { ext: '.org', price: 140000, desc: 'Untuk organisasi non-profit' },
  { ext: '.online', price: 80000, desc: 'Modern untuk bisnis online' },
  { ext: '.my.id', price: 50000, desc: 'Murah, cocok untuk personal' },
  { ext: '.biz.id', price: 75000, desc: 'Untuk bisnis kecil' },
];

export const PAKET_QUOTA: Record<string, { disk: number; bw: number }> = {
  'Starter': { disk: 5, bw: 20 },
  'Business': { disk: 30, bw: 100 },
  'Pro': { disk: 100, bw: 1000 },
  'Enterprise': { disk: 500, bw: 5000 },
  'Cloud S': { disk: 40, bw: 1000 },
  'Cloud M': { disk: 80, bw: 2000 },
  'Cloud L': { disk: 160, bw: 4000 },
  'Cloud XL': { disk: 320, bw: 10000 },
  'VPS Lite': { disk: 40, bw: 1000 },
  'VPS Standard': { disk: 80, bw: 2000 },
  'VPS Pro': { disk: 160, bw: 4000 },
  'VPS Ultimate': { disk: 320, bw: 10000 },
};

export function fmtRp(n: number): string {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(date: string | Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
  if (diff < 604800) return Math.floor(diff / 86400) + ' hari lalu';
  return fmtDate(date);
}
