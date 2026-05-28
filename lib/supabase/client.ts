'use client';

import { getSupabaseAnonKey, getSupabaseUrl } from './env';

export function getSupabaseBrowserConfig() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  };
}
