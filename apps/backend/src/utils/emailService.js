const nodemailer = require('nodemailer');
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  FRONTEND_URL
} = require('../config/env');

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send email function
const sendEmail = async (options) => {
  const mailOptions = {
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to News Website!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to News Website!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining our community. We're excited to have you here!</p>
      <p>You can now enjoy all the features of our platform:</p>
      <ul>
        <li>Read and comment on articles</li>
        <li>Bookmark your favorite articles</li>
        <li>Customize your profile</li>
      </ul>
      <p>Get started by exploring our latest articles:</p>
      <a href="${FRONTEND_URL}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Explore Articles</a>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br>The News Website Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The News Website Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
};

// Send newsletter subscription confirmation
const sendNewsletterConfirmation = async (email) => {
  const subject = 'Newsletter Subscription Confirmed';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Newsletter Subscription Confirmed!</h2>
      <p>Thank you for subscribing to our newsletter!</p>
      <p>You'll now receive our latest articles and updates directly in your inbox.</p>
      <p>If you wish to unsubscribe at any time, you can do so from any newsletter email.</p>
      <p>Best regards,<br>The News Website Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewsletterConfirmation
};
