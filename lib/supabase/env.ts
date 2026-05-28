const SUPABASE_URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return requireEnv(SUPABASE_URL_KEY);
}

export function getSupabaseAnonKey() {
  return requireEnv(SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey() {
  return requireEnv(SUPABASE_SERVICE_ROLE_KEY);
}

