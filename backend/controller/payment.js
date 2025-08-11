import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";
import crypto from "crypto";
import User from "../models/user.js";

dotenv.config();

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.ClientId,
  process.env.ClientSecret
);

function generateOrderId() {
  return crypto.randomBytes(12).toString("hex");
}

export const createPaymentSession = async (req, res) => {
  const orderId = generateOrderId();

  const request = {
    order_id: orderId,
    order_amount: 1.0,
    order_currency: "INR",
    customer_details: {
      customer_id: req.user.id.toString(), //  dynamic user id
      customer_phone: "9876543210",
      customer_email: req.user.email,      //  dynamic user email
    },
    order_meta: {
      return_url: `http://127.0.0.1:5500/signup/frontend/expense.html?order_id=${orderId}`
    },
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    const { payment_session_id } = response.data;
    res.json({ payment_session_id, order_id: orderId });
  } catch (err) {
    console.error("Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

export const verifyPaymentStatus = async (req, res) => {
  const { order_id } = req.query;
  try {
    const response = await cashfree.PGOrderFetchPayments( order_id);
    const transactions = response.data;

    let status = "Failure";

    if (transactions.some(txn => txn.payment_status === "SUCCESS")) {
      status = "Success";

      // ✅ Update user as premium
      await User.update(
        { isPremium: true },
        { where: { id: req.user.id } }
      );
    } 
    else if (transactions.some(txn => txn.payment_status === "PENDING")) {
      status = "Pending";
    }

    res.json({ order_id, status, transactions });
  } catch (err) {
    console.error("Verification Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
