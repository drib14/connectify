const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { signToken } = require("../utils/token");
const { withAuth, protectRoute } = require("../middlewares/auth");
const { sendResetCodeEmail } = require("../utils/email");

const router = express.Router();

const SALT_ROUNDS = 10;

/**
 * Sets the auth cookie with the JWT token.
 */
const setAuthCookie = (res, token) => {
  const maxAge = 24 * 60 * 60; // 1 day in seconds
  const isProduction = process.env.NODE_ENV === "production";
  let cookieString = `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  if (isProduction) {
    cookieString += "; Secure";
  }
  res.setHeader("Set-Cookie", cookieString);
};

/**
 * Clears the auth cookie.
 */
const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  let cookieString = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
  if (isProduction) {
    cookieString += "; Secure";
  }
  res.setHeader("Set-Cookie", cookieString);
};

// 1. Register with Email/Password
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    const token = signToken({
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
});

// 2. Login with Email/Password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    setAuthCookie(res, token);

    res.json({
      message: "Logged in successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

// 3. Logout
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully." });
});

// 4. Get Current User Info
router.get("/me", withAuth, protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "An error occurred fetching user details." });
  }
});

// 5. Google OAuth Callback / Exchange
router.post("/google", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Google authorization code is required." });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Google Client Credentials missing in Server environment variables.");
      return res.status(500).json({ error: "Google OAuth credentials not configured on server." });
    }

    // A. Swap code for access and ID tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri || "http://localhost:3000/auth/google/callback",
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google token exchange error response:", errorText);
      return res.status(400).json({ error: "Failed to exchange Google authorization code." });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // B. Fetch profile info using access token
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      console.error("Failed to fetch Google user profile.");
      return res.status(400).json({ error: "Failed to retrieve Google profile." });
    }

    const profileData = await profileResponse.json();
    const { sub: googleId, email, name, picture } = profileData;

    if (!email) {
      return res.status(400).json({ error: "Google account does not provide an email address." });
    }

    // C. Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = new User({
        username: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
      });
      await user.save();
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    setAuthCookie(res, token);

    res.json({
      message: "Google authentication successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ error: "An error occurred during Google authentication." });
  }
});

// 6. Forgot Password - Request 6-digit verification code
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't confirm if the user exists or not
      return res.json({ message: "If this email is registered, a verification code has been sent." });
    }

    // Generate a 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB with 15-minute expiry
    user.resetCode = verificationCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send the email (or log to console)
    await sendResetCodeEmail(user.email, verificationCode);

    res.json({ message: "If this email is registered, a verification code has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// 7. Reset Password - Verify 6-digit code and save new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, verification code, and new password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ error: "Invalid password reset request or code expired." });
    }

    // Check expiry
    if (Date.now() > user.resetCodeExpires) {
      return res.status(400).json({ error: "Verification code has expired." });
    }

    // Check code match
    if (user.resetCode !== code.trim()) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Save user password and clear reset fields
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "An error occurred while resetting your password." });
  }
});

module.exports = router;
