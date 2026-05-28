import { NextResponse, type NextRequest } from 'next/server';
import { buildAppUrl, getSafeRedirectPath, setSearchMessage } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = getSafeRedirectPath(formData.get('next'));

  if (!email || !password) {
    return NextResponse.redirect(
      buildAppUrl(
        request,
        setSearchMessage('/login', 'error', 'Email and password are required.', { next }),
      ),
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    buildAppUrl(
      request,
      setSearchMessage(
        '/login',
        'message',
        fullName
          ? 'Use the on-screen sign-up button to create your account.'
          : 'Use the on-screen sign-up button to create your account.',
        { next },
      ),
    ),
    { status: 303 },
  );
}
