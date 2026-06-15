import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (email, username) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Connectify!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0b0f19; color: #ffffff;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to Connectify, ${username}!</h2>
        <p>Thank you for joining Connectify, the ultimate modern social platform for sharing moments, music, and conversations.</p>
        <p>Here are the key features you can start exploring:</p>
        <ul>
          <li><strong>Pulse</strong>: Share posts, photos, videos, and search locations.</li>
          <li><strong>Moments</strong>: Share ephemeral 24-hour stories.</li>
          <li><strong>Clips</strong>: Create and swipe through short vertical videos.</li>
          <li><strong>Whisper</strong>: Direct messaging with real-time status and chat.</li>
          <li><strong>Vibe</strong>: Pin your favorite Spotify track to your Profile Canvas or share with posts.</li>
        </ul>
        <p>Let's share your Vibe with the world!</p>
        <p style="color: #6366f1; font-weight: bold; text-align: center;">- The Connectify Team</p>
        <p style="color: #666; font-size: 11px; text-align: center; margin-top: 30px;">This is an automated message. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${email}:`, error.message);
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Connectify Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Connectify Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0b0f19; color: #ffffff;">
        <h2 style="color: #ec4899; text-align: center;">Password Reset Request</h2>
        <p>You received this email because a password reset request was made for your Connectify account.</p>
        <p>Please click the button below to complete the process. This link is valid for 1 hour:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste the following link into your web browser:</p>
        <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color: #ec4899; font-weight: bold; text-align: center;">- The Connectify Security Team</p>
        <p style="color: #666; font-size: 11px; text-align: center; margin-top: 30px;">This is an automated security message. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset request email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset request email to ${email}:`, error.message);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Connectify Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Connectify Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0b0f19; color: #ffffff;">
        <h2 style="color: #10b981; text-align: center;">Password Reset Success!</h2>
        <p>Your Connectify password has been changed successfully.</p>
        <p>You can now sign in to your account with your new credentials. If you did not make this change, please contact our support team immediately.</p>
        <p style="color: #10b981; font-weight: bold; text-align: center;">- The Connectify Security Team</p>
        <p style="color: #666; font-size: 11px; text-align: center; margin-top: 30px;">This is an automated security message. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset success confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset success email to ${email}:`, error.message);
  }
};
