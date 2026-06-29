const nodemailer = require("nodemailer");

/**
 * Sends a password reset email with the 6-digit verification code.
 * Falls back to console logging in development if SMTP environment variables are missing.
 * 
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<boolean>} - True if sent or logged successfully
 */
async function sendResetCodeEmail(email, code) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT || "465";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const from = process.env.SMTP_FROM || `"${user || 'Connectify Support'}" <${user || 'no-reply@connectify.com'}>`;

  // Check if SMTP configuration is provided
  if (!user || !pass) {
    console.log("\n==================================================");
    console.log("             [DEV] EMAIL VERIFICATION CODE        ");
    console.log(` To:      ${email}`);
    console.log(` Code:    ${code}`);
    console.log(" Subject: Connectify Password Reset Verification Code");
    console.log(" Message: Your 6-digit password reset verification code is " + code);
    console.log(" (Configure SMTP_HOST/PORT/USER/PASS in server/.env to send real emails)");
    console.log("==================================================\n");
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port === "465", // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Connectify Password Reset Verification Code",
      text: `Your 6-digit password reset verification code is: ${code}. This code will expire in 15 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
          <h2 style="color: #4f46e5; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Use the verification code below to proceed:</p>
          <div style="background-color: #f4f4f5; border-radius: 8px; padding: 15px; margin: 24px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #18181b;">${code}</span>
          </div>
          <p style="color: #71717a; font-size: 14px; line-height: 1.5;">This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
          <p style="color: #a1a1aa; font-size: 12px; text-align: center;">Connectify AI-Powered Study Platform</p>
        </div>
      `,
    });

    console.log(`[Email Service]: Verification email sent to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email Service Error]: Failed to send verification email:", error);
    // Even if SMTP fails, we want to log the code in console for fallback debugging
    console.log(`[Email Service Fallback Code]: ${code}`);
    throw error;
  }
}

module.exports = {
  sendResetCodeEmail,
};
