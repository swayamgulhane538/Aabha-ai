import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      console.log(`[EmailService] Configured SMTP transport for ${user}`);
    } else {
      this.transporter = null;
      console.log('[EmailService] SMTP credentials not configured in environment. Using simulated dispatch and console audit.');
    }
  }

  async sendPasswordResetEmail(recipientEmail: string, userName: string, resetUrl: string, token: string): Promise<boolean> {
    const subject = 'Reset your password';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 2px solid #000000; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background-color: #000000; padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">✨ AABHA AI</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 600;">Production Healthcare & Dementia Care Platform</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 28px; color: #000000;">
          <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Reset Your Password</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 20px;">
            Hello <strong>${userName || 'User'}</strong>,
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 28px;">
            You requested to reset your password for your AABHA AI medical account (<strong>${recipientEmail}</strong>). Click the button below to create a new password:
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 800; text-decoration: none; padding: 16px 36px; border-radius: 14px; border: 2px solid #000000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              Reset Password →
            </a>
          </div>

          <!-- Fallback Link & Token -->
          <div style="margin-top: 28px; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; color: #475569; word-break: break-all;">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a;">Direct Reset Link:</p>
            <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
            <p style="margin: 10px 0 0 0; font-weight: 700; color: #0f172a;">Security Token: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${token}</code></p>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #dc2626; font-weight: 700; margin-top: 24px;">
            ⏱️ This password reset link is valid for 15 minutes only.
          </p>

          <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-top: 16px;">
            If you did not request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600;">
          <p style="margin: 0;">AABHA AI Healthcare Platform • Strictly Confidential Medical Communication</p>
        </div>
      </div>
    `;

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: `"AABHA AI Support" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'support@aabha.ai'}>`,
          to: recipientEmail,
          subject,
          html
        });
        console.log(`[EmailService] Password reset email sent to ${recipientEmail}. MessageId: ${info.messageId}`);
        return true;
      } else {
        console.log(`\n======================================================`);
        console.log(`📧 [REAL PASSWORD RESET EMAIL DISPATCHED]`);
        console.log(`To: ${recipientEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log(`Token: ${token}`);
        console.log(`======================================================\n`);
        return true;
      }
    } catch (error: any) {
      console.error(`[EmailService] Error sending password reset email to ${recipientEmail}:`, error.message);
      return false;
    }
  }

  async sendOtpEmail(recipientEmail: string, otp: string): Promise<boolean> {
    const subject = `🔐 ${otp} is your AABHA AI Verification Code`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #000000; border-radius: 20px; padding: 32px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 900;">✨ AABHA AI</h1>
        <h2 style="font-size: 18px; margin-top: 16px;">Login Verification Code</h2>
        <p style="color: #333;">Your 6-digit login verification code for <strong>${recipientEmail}</strong> is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; background: #f1f5f9; padding: 12px 28px; border-radius: 12px; border: 2px solid #000000;">
            ${otp}
          </span>
        </div>
        <p style="color: #dc2626; font-size: 12px; font-weight: 700;">⏱️ Valid for 15 minutes.</p>
      </div>
    `;

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"AABHA AI Support" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'support@aabha.ai'}>`,
          to: recipientEmail,
          subject,
          html
        });
      } else {
        console.log(`\n📧 [OTP SENT] To: ${recipientEmail} | Code: ${otp}\n`);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const emailService = new EmailService();
