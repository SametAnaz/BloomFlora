/**
 * Turnstile Verify API
 * Backend endpoint to validate Cloudflare Turnstile tokens
 */

import { NextRequest, NextResponse } from 'next/server';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token eksik' },
        { status: 400 },
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Sunucu yapılandırma hatası' },
        { status: 500 },
      );
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    // Forward client IP for better accuracy
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for');
    if (ip) {
      formData.append('remoteip', ip);
    }

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Bot doğrulama başarısız',
        codes: data['error-codes'],
      },
      { status: 403 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Doğrulama hatası' },
      { status: 500 },
    );
  }
}
