import { Resend } from "resend";

/**
 * Email service using Resend (free tier: 3,000 emails/month).
 * Used for email verification, password reset, and security alerts.
 */

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend API.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await getResend().emails.send({
      from: "StoryForge AI <noreply@storyforge.ai>",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

/**
 * Send email verification link to a new user.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your StoryForge AI email",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Welcome to StoryForge AI!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your StoryForge AI password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Password Reset</h1>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send security alert for new device login.
 */
export async function sendNewDeviceAlert(
  email: string,
  deviceInfo: { browser: string; os: string; device: string },
  ipAddress: string
) {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return sendEmail({
    to: email,
    subject: "New sign-in to your StoryForge AI account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">New Sign-In Detected</h1>
        <p>Your StoryForge AI account was accessed from a new device:</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #666;">Browser</td>
            <td style="padding: 8px 16px;">${deviceInfo.browser}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #666;">OS</td>
            <td style="padding: 8px 16px;">${deviceInfo.os}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #666;">Device</td>
            <td style="padding: 8px 16px;">${deviceInfo.device}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #666;">IP Address</td>
            <td style="padding: 8px 16px;">${ipAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px; font-weight: bold; color: #666;">Time</td>
            <td style="padding: 8px 16px;">${timestamp}</td>
          </tr>
        </table>
        <p style="color: #dc2626; font-weight: bold;">
          If this wasn't you, change your password immediately.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/forgot-password"
           style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Secure My Account
        </a>
      </div>
    `,
  });
}
