//authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // make sure you import your User model correctly

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Login endpoint
router.post("/login", async (req, res) => {
  console.log("Login request body:", req.body); // Confirm request received

  try {
    const { username, password } = req.body;
    console.log("Username:", username, "Password:", password);

    if (!username || !password) {
      console.log("Missing credentials");
      return res.status(400).json({ error: "username and password required" });
    }

    const user = await User.findOne({ where: { username } });
    console.log("Found user:", user ? user.toJSON() : null);

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.password !== password) {
      console.log("Incorrect password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Generated token:", token);

    return res.json({
      message: "login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        lang_pairs: [
          user.lang_pair,
          user.lang_pair2,
          user.lang_pair3,
          user.lang_pair4,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Verify token endpoint
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }
    console.log("✅ Login successful. Sending token...");
    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        lang_pairs: [
          user.lang_pair1,
          user.lang_pair2,
          user.lang_pair3,
          user.lang_pair4,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});
export default router;
