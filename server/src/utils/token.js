const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "superultramegasecret";

/**
 * Signs a JWT token with the given payload.
 * @param {object} payload - Data to encode in the token.
 * @param {string} [expiresIn="24h"] - Token expiration time.
 * @returns {string} Signed JWT token.
 */
const signToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 * @param {string} token - The JWT token to verify.
 * @returns {object|null} Decoded payload or null.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { signToken, verifyToken };
