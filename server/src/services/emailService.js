const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Connectify! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0e1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e1a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#131832 0%,#1a1f3a 100%);border-radius:20px;overflow:hidden;border:1px solid rgba(0,212,170,0.2);">
                <!-- Header -->
                <tr>
                  <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(14,165,233,0.15));">
                    <h1 style="color:#00d4aa;font-size:32px;margin:0;font-weight:700;letter-spacing:-0.5px;">Connectify</h1>
                    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:8px 0 0;">Where authentic connections thrive</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:30px 40px;">
                    <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">Welcome aboard, ${user.firstName}! 🚀</h2>
                    <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;margin:0 0 24px;">
                      We're thrilled to have you join Connectify — a platform built around <strong style="color:#00d4aa;">authentic connections</strong>, 
                      <strong style="color:#0ea5e9;">meaningful communities</strong>, and <strong style="color:#a855f7;">real growth</strong>.
                    </p>
                    <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;margin:0 0 24px;">
                      Here's what makes Connectify different:
                    </p>
                    <!-- Features -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="padding:12px 16px;background:rgba(0,212,170,0.1);border-radius:12px;margin-bottom:8px;">
                          <p style="color:#00d4aa;font-size:14px;margin:0;font-weight:600;">🔒 Trust Circles</p>
                          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0 0;">Share with the right people — family, friends, coworkers, or everyone.</p>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:rgba(14,165,233,0.1);border-radius:12px;">
                          <p style="color:#0ea5e9;font-size:14px;margin:0;font-weight:600;">🎯 Goal Tracking</p>
                          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0 0;">Set goals, find accountability partners, and track your progress.</p>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:rgba(168,85,247,0.1);border-radius:12px;">
                          <p style="color:#a855f7;font-size:14px;margin:0;font-weight:600;">🌍 Impact Communities</p>
                          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0 0;">Collaborate to solve real problems and make a difference.</p>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:8px 0 16px;">
                          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/feed" 
                             style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#00d4aa,#0ea5e9);color:#0a0e1a;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.5px;">
                            Start Exploring →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px 30px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
                    <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
                      © ${new Date().getFullYear()} Connectify. All rights reserved.<br>
                      You're receiving this because you signed up at Connectify.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email: ${error.message}`);
  }
};

const sendNotificationEmail = async (to, subject, content) => {
  const mailOptions = {
    from: `"Connectify" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="background:#0a0e1a;padding:40px 20px;font-family:sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#131832;border-radius:16px;padding:32px;border:1px solid rgba(0,212,170,0.2);">
          <h1 style="color:#00d4aa;font-size:24px;margin:0 0 8px;">Connectify</h1>
          <div style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;">${content}</div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
  }
};

module.exports = { sendWelcomeEmail, sendNotificationEmail };
