import { clerkMiddleware, requireAuth } from "@clerk/express";

/**
 * Global or route-specific Clerk middleware.
 * Attaches the `req.auth` property to the Express request object, which contains
 * information about the current user's session.
 */
export const withAuth = clerkMiddleware();

/**
 * Middleware that strictly protects routes.
 * If the user is not authenticated, this middleware will return a 401 response.
 */
export const protectRoute = requireAuth();
