const { verifyToken } = require("../utils/token");

/**
 * Parses cookies from the Cookie header string.
 * @param {string|undefined} cookieHeader
 * @returns {object} Key-value pairs of cookies.
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookies;
}

/**
 * Authentication middleware.
 * Parses JWT token from cookie or Authorization header and attaches user context.
 */
const withAuth = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies["token"];

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      };
      req.auth = {
        userId: decoded.id,
      };
    }
  }

  next();
};

/**
 * Middleware that strictly protects routes.
 * If the user is not authenticated, returns a 401 response.
 */
const protectRoute = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Access denied." });
  }
  next();
};

module.exports = { withAuth, protectRoute };
