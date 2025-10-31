const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Get email transporter (with caching)
 */
const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // No SMTP configured; return a mock transporter that logs instead of sending
  if (!host) {
    cachedTransporter = {
      sendMail: async (opts) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[MAIL MOCK] Would send mail:', {
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
          });
        }
        return { accepted: [opts.to], messageId: 'mock-message-id' };
      }
    };
    console.log('⚠️  No SMTP configured - using mock email service');
    return cachedTransporter;
  }

  // Create real transporter
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  // Verify connection
  cachedTransporter.verify((error) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
    } else {
      console.log('✅ SMTP server ready to send emails');
      console.log(`📧 Email: ${user}`);
    }
  });

  return cachedTransporter;
};

/**
 * Send email
 */
const sendMail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@nephslair.com';

  try {
    const info = await transporter.sendMail({
      from: `"Nephslair" <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">Welcome to Nephslair!</h1>
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>Thank you for registering. Please verify your email by clicking the button below:</p>
      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p style="color: #666;">Or copy this link: <br><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Verify Your Email - Nephslair',
    html,
    text: `Welcome to Nephslair! Verify your email: ${verificationUrl}`,
  });
};

/**
 * Send welcome email (after successful registration)
 */
const sendWelcomeEmail = async (user) => {
  const frontendUrl = process.env.FRONTEND_BASE_URL?.trim() || 
    (process.env.NODE_ENV === 'production' ? 'https://nephslair.com' : 'http://localhost:5173');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">Welcome to Nephslair!</h1>
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>Thank you for registering! Your account has been successfully created.</p>
      <p>You can now sign in and start exploring all the amazing content on Nephslair.</p>
      <div style="margin: 30px 0;">
        <a href="${frontendUrl}/login" 
           style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Sign In Now
        </a>
      </div>
      <p style="color: #666;">Or visit our homepage: <br><a href="${frontendUrl}">${frontendUrl}</a></p>
      <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Welcome to Nephslair! - Registration Successful',
    html,
    text: `Welcome to Nephslair! Your account has been successfully created. Sign in at: ${frontendUrl}/login`,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_BASE_URL?.trim() || (process.env.NODE_ENV === 'production' ? 'https://nephslair.com' : 'http://localhost:5173')}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">Password Reset Request</h1>
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">Or copy this link: <br><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Password Reset - Nephslair',
    html,
    text: `Password reset link: ${resetUrl}`,
  });
};

module.exports = {
  getTransporter,
  sendMail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};