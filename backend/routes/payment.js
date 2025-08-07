import express from "express";
import { authentication } from "../middleware/auth.js";
import User from "../models/user.js";
import { createPaymentSession, verifyPaymentStatus } from "../controller/payment.js";

const route = express.Router();

route.get("/", (req, res) => {
  res.send("home");
});

// ✅ Protect routes with authentication
route.post("/payment", authentication, createPaymentSession);
route.post("/verify", authentication, verifyPaymentStatus);

route.get("/check-premium", authentication, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ isPremium: user.isPremium });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch premium status" });
  }
});

export default route;
