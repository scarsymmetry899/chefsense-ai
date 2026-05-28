import { NextResponse, type NextRequest } from 'next/server';
import { buildAppUrl } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  return NextResponse.redirect(
    buildAppUrl(request, '/login?message=Use%20the%20on-screen%20sign-out%20control.'),
    { status: 303 },
  );
}
