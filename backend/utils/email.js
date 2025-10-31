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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 20px; text-align: center;">Welcome to Nephslair! 🎉</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${user.username}</strong>,</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Thank you for registering! Your account has been successfully created.</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You can now sign in and start exploring all the amazing content on Nephslair.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${frontendUrl}/login" 
             style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
            Sign In Now
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px; margin-bottom: 8px;">Or visit our homepage:</p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-bottom: 24px;">
          <a href="${frontendUrl}" style="color: #3b82f6; text-decoration: none;">${frontendUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            🔒 If you didn't create this account, please ignore this email.
          </p>
        </div>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Questions? Visit our homepage:</p>
          <p style="margin: 0;">
            <a href="${frontendUrl}" style="color: #7c3aed; text-decoration: none; font-size: 12px;">${frontendUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Welcome to Nephslair! - Registration Successful',
    html,
    text: `Welcome to Nephslair! Hi ${user.username},\n\nThank you for registering! Your account has been successfully created.\n\nYou can now sign in at: ${frontendUrl}/login\n\nOr visit our homepage: ${frontendUrl}\n\nIf you didn't create this account, please ignore this email.`,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const frontendUrl = process.env.FRONTEND_BASE_URL?.trim() || 
    (process.env.NODE_ENV === 'production' ? 'https://nephslair.com' : 'http://localhost:5173');
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 20px; text-align: center;">Password Reset Request</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${user.username}</strong>,</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px; margin-bottom: 8px;">Or copy and paste this link into your browser:</p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin-bottom: 24px;">
          <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none;">${resetUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin-bottom: 8px;">
            ⏰ This link will expire in <strong>30 minutes</strong> for your security.
          </p>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            🔒 If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Need help? Visit our homepage:</p>
          <p style="margin: 0;">
            <a href="${frontendUrl}" style="color: #7c3aed; text-decoration: none; font-size: 12px;">${frontendUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Reset Your Password - Nephslair',
    html,
    text: `Hi ${user.username},\n\nYou requested to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.`,
  });
};

module.exports = {
  getTransporter,
  sendMail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};