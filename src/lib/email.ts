import nodemailer from 'nodemailer';
import { config } from '@/config';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send a verification email to a user
 * @param email User's email address
 * @param token Verification token
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Verify your email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Verify your email</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Click the button below to verify your email address. This link will expire in 24 hours.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendPasswordChangedEmail(email: string) {
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Password changed successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Changed</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          Your password has been successfully changed. If you didn't make this change, 
          please contact our support team immediately.
        </p>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  });
}

interface EsimProfile {
  qrCode: string;
  iccid: string;
  eid: string;
  smdpStatus: string;
  esimStatus: string;
  dataRemaining: number;
  dataUsed: number;
  expiryDate: string;
  daysRemaining: number;
  packageCode: string;
  amount: number;
  currency: string;
  discountCode?: string;
  discountPercentage?: number;
}

export async function sendEsimEmail(
  to: string,
  orderNo: string,
  esimProfile: EsimProfile
) {
  const mailOptions = {
    from: 'eSIM <esim@yourdomain.com>',
    to: [to],
    subject: 'Your eSIM is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your eSIM is Ready!</h1>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1f2937;">Order Details</h2>
          <p><strong>Order Number:</strong> ${orderNo}</p>
          <p><strong>Package:</strong> ${esimProfile.packageCode}</p>
          <p><strong>Amount:</strong> ${esimProfile.amount} ${esimProfile.currency}</p>
          ${esimProfile.discountCode ? `
            <p><strong>Discount Code:</strong> ${esimProfile.discountCode}</p>
            <p><strong>Discount Applied:</strong> ${esimProfile.discountPercentage}%</p>
            <p><strong>Original Amount:</strong> ${(esimProfile.amount / (1 - esimProfile.discountPercentage / 100)).toFixed(2)} ${esimProfile.currency}</p>
          ` : ''}
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <h2 style="color: #1f2937;">Your eSIM QR Code</h2>
          <img 
            src="data:image/png;base64,${esimProfile.qrCode}" 
            alt="eSIM QR Code" 
            style="max-width: 300px; margin: 20px auto;"
          />
          <p style="color: #6b7280; margin-top: 10px;">
            If the QR code image is not visible, you can scan this code directly:<br>
            <strong style="word-break: break-all;">${esimProfile.qrCode}</strong>
          </p>
        </div>

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1f2937;">How to Install Your eSIM</h2>
          <ol style="margin-left: 20px;">
            <li>Open your device's camera and scan the QR code</li>
            <li>Follow the on-screen instructions to add the eSIM</li>
            <li>Once installed, go to Settings > Cellular/Mobile Data to activate your eSIM</li>
            <li>Select your new eSIM as the primary line or for data</li>
          </ol>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1f2937;">eSIM Details</h2>
          <p><strong>ICCID:</strong> ${esimProfile.iccid}</p>
          <p><strong>EID:</strong> ${esimProfile.eid}</p>
          <p><strong>Status:</strong> ${esimProfile.esimStatus}</p>
          <p><strong>Data Remaining:</strong> ${esimProfile.dataRemaining} MB</p>
          <p><strong>Data Used:</strong> ${esimProfile.dataUsed} MB</p>
          <p><strong>Expiry Date:</strong> ${new Date(esimProfile.expiryDate).toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> ${esimProfile.daysRemaining}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send eSIM email:', error);
    throw error;
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
} 