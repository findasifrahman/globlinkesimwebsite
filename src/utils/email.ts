import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generateEsimEmailHtml(orderNo: string, qrCode: string, iccid: string, eid: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your eSIM is Ready!</h2>
      <p>Your order #${orderNo} has been processed and your eSIM is ready to use.</p>
      
      <div style="margin: 20px 0;">
        <h3>Scan this QR code to activate your eSIM:</h3>
        <img src="${qrCode}" alt="eSIM QR Code" style="max-width: 200px;"/>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h3>eSIM Details:</h3>
        <p><strong>ICCID:</strong> ${iccid}</p>
        <p><strong>EID:</strong> ${eid}</p>
      </div>
      
      <p style="margin-top: 20px;">
        If you have any questions, please contact our support team.
      </p>
    </div>
  `;
} 