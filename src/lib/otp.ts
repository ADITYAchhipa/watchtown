import crypto from 'crypto';

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

// In-memory OTP storage keyed by normalized email
const otpStore = new Map<string, OtpRecord>();

// Expiration time: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;
// Maximum verification attempts per OTP
const MAX_ATTEMPTS = 5;
// Cooldown between resending OTP: 45 seconds
const RESEND_COOLDOWN_MS = 45 * 1000;

export function generateOtp(): string {
  // Cryptographically secure 6-digit numeric OTP
  return crypto.randomInt(100000, 1000000).toString();
}

export function saveOtp(email: string, otp: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = otpStore.get(normalizedEmail);
  const now = Date.now();

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
    };
  }

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
  });

  return { success: true };
}

export function verifyOtp(email: string, enteredOtp: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return {
      valid: false,
      error: 'No verification code was requested for this email, or it has expired. Please request a new OTP.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      error: 'The verification code has expired. Please request a new OTP.',
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  const cleanEntered = enteredOtp.trim();
  if (record.otp !== cleanEntered) {
    record.attempts++;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Verification successful: remove used OTP
  otpStore.delete(normalizedEmail);
  return { valid: true };
}
