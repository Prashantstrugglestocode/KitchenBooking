import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
// Note: In a distributed environment (Vercel/Serverless), this would need Redis (e.g., Upstash).
// For a single server instance, this Map works fine.
const rateLimit = new Map<string, { count: number; lastReset: number }>();

// Limit: 60 requests per minute per IP
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.ip || '127.0.0.1';

  // 0. DoS Protection (Rate Limiting)
  const now = Date.now();
  const record = rateLimit.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > WINDOW_MS) {
    // Reset window
    record.count = 1;
    record.lastReset = now;
  } else {
    // Increment count
    record.count++;
  }
  
  // Save back to map
  rateLimit.set(ip, record);

  if (record.count > MAX_REQUESTS) {
     return new NextResponse("Too Many Requests (DoS Protection)", { 
         status: 429,
         headers: {
             'Retry-After': '60'
         }
     });
  }

  // 1. Security Headers
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // HSTS (Strict-Transport-Security) - 1 year
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  // Content Security Policy (Basic)
  // We need 'unsafe-inline' and 'unsafe-eval' for Next.js in dev mode often, but let's start strict-ish.
  // Actually, for a simple app, we can be relatively strict.
  // Note: 'unsafe-eval' is often required by Next.js in dev.
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', csp);

  // 2. Session Management for Rate Limiting
  // Check if we have a device_session cookie
  let deviceSession = request.cookies.get('device_session')?.value;

  if (!deviceSession) {
    // Determine if we should set a new session
    // We only need to set it if it's missing.
    deviceSession = crypto.randomUUID();
    
    // Set the cookie on the response
    response.cookies.set({
      name: 'device_session',
      value: deviceSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
