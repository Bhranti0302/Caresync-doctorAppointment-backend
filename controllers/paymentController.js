import Stripe from "stripe";
import dotenv from "dotenv";
import Appointment from "../models/appointmentModel.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------
// Create Payment Intent
// -------------------
export const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.paid)
      return res.status(400).json({ message: "Payment already completed" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: appointment.fees * 100, // in smallest currency unit
      currency: "inr",
      metadata: { appointmentId: appointment._id.toString() },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------
// Stripe Webhook
// -------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const appointmentId = intent.metadata.appointmentId;

      await Appointment.findByIdAndUpdate(appointmentId, { paid: true });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
