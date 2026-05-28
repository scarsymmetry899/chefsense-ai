import { NextResponse, type NextRequest } from 'next/server';
import { buildAppUrl, getSafeRedirectPath, setSearchMessage } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = getSafeRedirectPath(searchParams.get('next'));

  return NextResponse.redirect(
    buildAppUrl(
      request,
      setSearchMessage('/login', 'message', 'If email confirmation is enabled, confirm your email and then sign in from the app.', { next }),
    ),
    { status: 303 },
  );
}
