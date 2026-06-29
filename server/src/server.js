const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { withAuth, protectRoute } = require("./middlewares/auth");
const authRoutes = require("./routes/auth");
const studyRoutes = require("./routes/study");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Apply custom JWT authentication globally
app.use(withAuth);

// Custom Router Registration
app.use("/api/auth", authRoutes);
app.use("/api/study", protectRoute, studyRoutes);

// Connect to Database
connectDB();

// Public Endpoint
app.get("/api/public/hello", (req, res) => {
  res.json({
    message: "Welcome to Connectify API! This endpoint is public.",
    timestamp: new Date().toISOString(),
  });
});

// Protected Endpoint (requires valid session)
app.get("/api/protected/test", protectRoute, (req, res) => {
  res.json({
    message: "Successfully accessed protected route!",
    userId: req.auth.userId,
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server]: Connectify backend running on port ${PORT}`);
});
