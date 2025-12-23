import express from "express";
import {
  createPaymentIntent,
  stripeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Payment Intent
router.post("/create-payment-intent", createPaymentIntent);

// Stripe Webhook (raw body required!)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
