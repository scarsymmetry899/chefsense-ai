import { NextResponse } from 'next/server';

/**
 * Auth callback handler for Supabase email confirmation / magic links.
 *
 * Supabase redirects here after verifying an email OTP or magic link.
 * The access_token / error are appended as a HASH fragment, not query params.
 * Server-side 303 redirects strip hash fragments, so we must return a minimal
 * HTML page and let client-side JavaScript forward the full URL (hash included)
 * to /login where consumeAuthHashFromUrl() handles the session.
 */
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ChefSense AI — Signing in…</title>
  <style>
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      font-family: -apple-system, sans-serif;
      background: #fdf8f3;
      color: #7a5c3a;
    }
    p { font-size: 15px; margin: 0; }
  </style>
</head>
<body>
  <p>Verifying your account…</p>
  <script>
    // Preserve the hash fragment (access_token / error) when forwarding to /login.
    // A server-side redirect would strip it, so we do this client-side.
    window.location.replace('/login' + window.location.hash);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
