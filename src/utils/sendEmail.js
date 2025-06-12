const nodemailer = require('nodemailer');
const env = require('../config/env'); // Import centralized env
const { InternalServerError } = require('./errors/index'); // Corrected path

const sendEmail = async (options) => {
  // Basic check if email configuration is present
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.FROM_EMAIL) {
    console.error('Email service is not configured. Please check SMTP environment variables.');
    // Throw a specific operational error for configuration issues
    throw new InternalServerError(
      'Email service is not configured due to missing environment variables.',
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${env.FROM_NAME || 'App'} <${env.FROM_EMAIL}>`, // Use FROM_NAME or a default
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
