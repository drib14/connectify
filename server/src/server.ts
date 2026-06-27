import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { withAuth, protectRoute } from "./middlewares/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Apply Clerk globally to attach session state (req.auth) to all routes
app.use(withAuth);

// Database Connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("Error: MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB successfully."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Public Endpoint
app.get("/api/public/hello", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Connectify API! This endpoint is public.",
    timestamp: new Date().toISOString(),
  });
});

// Protected Endpoint (requires valid Clerk session)
app.get("/api/protected/test", protectRoute, (req: Request, res: Response) => {
  const auth = (req as any).auth;
  res.json({
    message: "Successfully accessed protected route!",
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server]: Connectify backend running on port ${PORT}`);
});
