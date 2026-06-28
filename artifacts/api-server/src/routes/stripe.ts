import { Router } from "express";
import { getUncachableStripeClient } from "../lib/stripeClient.js";

const router = Router();

router.post("/checkout", async (req, res) => {
  const { items } = req.body as {
    items: Array<{ name: string; price: number; quantity: number; size?: string }>;
  };

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "No items provided" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const origin = `https://${process.env["REPLIT_DOMAINS"]?.split(",")[0] ?? "localhost"}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: "auto",
      line_items: items.map((item) => ({
        price_data: {
          currency: "ils",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name + (item.size ? ` (${item.size})` : ""),
          },
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/cart?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;
