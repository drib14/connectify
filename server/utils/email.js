const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Connectify Password Reset - Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6366f1;">Connectify Security</h2>
        <p>You requested to reset your password. Use the verification OTP below to complete the action. This OTP is valid for 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; background-color: #f3f4f6; color: #1f2937; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">If you did not make this request, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', email, ':', info.messageId);
    return true;
  } catch (err) {
    console.error('Nodemailer error sending OTP:', err);
    return false;
  }
};

const sendPremiumReceipt = async (email, username, amount) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Connectify Premium!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); color: #ffffff;">
        <h2 style="color: #eab308;">🌟 Connectify Premium Activated!</h2>
        <p>Hello ${username},</p>
        <p>Thank you for your payment of <strong>$${amount}</strong>. Your account has been upgraded to Connectify Premium!</p>
        <p>Enjoy these exclusive features:</p>
        <ul style="line-height: 1.6;">
          <li>🛡️ Golden profile avatar shield and premium badging</li>
          <li>🎨 Exclusive interactive glassmorphic theme presets</li>
          <li>🚀 Double daily Connectify Spark challenges points</li>
          <li>💬 Custom bubble fonts and status options</li>
        </ul>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 20px;">Let's build stronger connections!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Premium receipt email sent to', email);
    return true;
  } catch (err) {
    console.error('Nodemailer error sending premium receipt:', err);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPremiumReceipt,
};
