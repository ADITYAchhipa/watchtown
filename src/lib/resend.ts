import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WatchTown <onboarding@resend.dev>';

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendOtpEmail(
  email: string,
  otp: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const name = recipientName?.trim() || 'Watch Collector';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WatchTown Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #111827 0%, #000000 100%); padding: 36px 40px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                      WATCH<span style="color: #d4af37;">TOWN</span>
                    </div>
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">
                      Luxury Timepieces & Replicas
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #111827;">
                      Verify Your Email Address
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                      Hello <strong>${name}</strong>,<br>
                      Thank you for joining WatchTown. Please use the following One-Time Password (OTP) to complete your account registration:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="text-align: center; margin: 32px 0;">
                      <div style="display: inline-block; background: #f9fafb; border: 2px dashed #d4af37; border-radius: 12px; padding: 18px 36px;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #111827; font-family: monospace;">
                          ${otp}
                        </span>
                      </div>
                      <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280;">
                        This code is valid for <strong>10 minutes</strong>.
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      If you did not request this verification code, please disregard this email or contact support. Never share your OTP with anyone.
                    </p>

                    <div style="border-top: 1px solid #f3f4f6; margin-top: 30px; padding-top: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        WatchTown India &bull; Free Express Delivery & COD Nationwide
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn(
      `\n======================================================\n` +
      `[RESEND NOT CONFIGURED] RESEND_API_KEY is not set.\n` +
      `Simulated OTP for ${email}: ${otp}\n` +
      `To send live emails, set RESEND_API_KEY in your .env.local file.\n` +
      `======================================================\n`
    );
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `WatchTown Verification Code: ${otp}`,
      html: htmlContent,
      text: `Your WatchTown registration OTP code is: ${otp}. It is valid for 10 minutes.`,
    });

    if (response.error) {
      console.error('[Resend Error]', response.error);
      return {
        success: false,
        error: response.error.message || 'Failed to send OTP email via Resend',
      };
    }

    console.log(`[Resend] OTP email sent successfully to ${email}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return {
      success: false,
      error: err.message || 'Error communicating with Resend email API',
    };
  }
}
