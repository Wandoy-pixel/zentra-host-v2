export type Profile = {
  id: string;
  fullname: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

export type Order = {
  id: number;
  user_id: string;
  name: string;
  type: 'shared' | 'cloud' | 'vps' | 'domain';
  period: number;
  price: number;
  payment: string | null;
  created_at: string;
};

export type DnsRecord = {
  id: number;
  user_id: string;
  domain: string;
  record_type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
  created_at: string;
};

export type Backup = {
  id: number;
  user_id: string;
  name: string;
  backup_type: 'manual' | 'auto' | 'incremental';
  size_mb: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

export type Notification = {
  id: number;
  user_id: string;
  icon: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
};

export type ActivityLog = {
  id: number;
  user_id: string;
  icon: string;
  action: string;
  description: string | null;
  color: 'default' | 'purple' | 'orange' | 'success' | 'danger';
  created_at: string;
};

export type Subdomain = {
  id: number;
  user_id: string;
  subdomain: string;
  target: string;
  created_at: string;
};

export type EmailAccount = {
  id: number;
  user_id: string;
  email_address: string;
  quota_mb: number;
  created_at: string;
};

export type UserDatabase = {
  id: number;
  user_id: string;
  database_name: string;
  db_user: string;
  created_at: string;
};

export type Paket = {
  name: string;
  desc: string;
  price: number;
  oldPrice: number;
  features: string[];
  popular?: boolean;
};

export type Package = {
  name: string;
  type: 'shared' | 'cloud' | 'vps';
  price: number;
  period: number;
};
