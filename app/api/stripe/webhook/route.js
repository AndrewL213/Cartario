import { NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  STRIPE_WEBHOOK_SECRET,
} from "../../../../lib/stripe";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

async function setSubscription(admin, { customerId, userId, status }) {
  const isPremium = ACTIVE_STATUSES.has(status);
  const patch = { is_premium: isPremium, subscription_status: status };

  let q = admin.from("profiles").update(patch);
  if (userId) q = q.eq("id", userId);
  else q = q.eq("stripe_customer_id", customerId);
  const { error } = await q;
  if (error) console.error("webhook: profile update failed", error);
}

export async function POST(request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "no-admin" }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `signature: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        let status = "active";
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription);
          status = sub.status;
        }
        await setSubscription(admin, {
          customerId: s.customer,
          userId: s.client_reference_id || s.metadata?.supabase_user_id || null,
          status,
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : sub.status;
        await setSubscription(admin, {
          customerId: sub.customer,
          userId: sub.metadata?.supabase_user_id || null,
          status,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
