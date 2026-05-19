const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Assuming gmail based on standard patterns with app passwords
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmailVerification = async (to, firstName, link) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Connectify - Verify your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6b21a8;">Welcome to Connectify!</h2>
        <p>Hi ${firstName},</p>
        <p>Thanks for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #6b21a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b21a8;"><a href="${link}">${link}</a></p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetOtp = async (to, firstName, otp) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Connectify - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6b21a8;">Password Reset</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Here is your 6-digit OTP code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6b21a8; padding: 10px 20px; background-color: #f3e8ff; border-radius: 8px;">${otp}</span>
        </div>
        <p>This code is valid for 10 minutes. Please enter it in the app to reset your password.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmailVerification,
  sendPasswordResetOtp,
};
