import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, saveOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/resend';
import { checkUserExists } from '@/lib/auth';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    let rateData = rateLimitMap.get(ip);
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 1, resetTime: now + 60 * 60 * 1000 };
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > 10) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, name, type = 'register' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // If registering, make sure email isn't already registered
    if (type === 'register') {
      const exists = await checkUserExists(normalizedEmail);
      if (exists) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = generateOtp();

    // Store in OTP manager (with cooldown and expiration)
    const saveResult = saveOtp(normalizedEmail, otp);
    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error },
        { status: 429 }
      );
    }

    // Send email via Resend API
    const emailResult = await sendOtpEmail(normalizedEmail, otp, name);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: emailResult.simulated
        ? 'Verification code generated (check server logs for simulated OTP).'
        : 'A 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('[send-otp] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending OTP.' },
      { status: 500 }
    );
  }
}
