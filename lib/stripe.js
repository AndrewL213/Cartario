import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export function isStripeConfigured() {
  return Boolean(secret && STRIPE_PRICE_ID);
}

let cached = null;

export function getStripe() {
  if (!secret) return null;
  if (!cached) cached = new Stripe(secret);
  return cached;
}
