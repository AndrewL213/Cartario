import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";
import { getStripe, isStripeConfigured } from "../../../../lib/stripe";

export const runtime = "nodejs";

// Abre el portal de cliente de Stripe (gestionar / cancelar la suscripción).
export async function POST(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "no-customer" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/precios`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe portal error", err);
    return NextResponse.json(
      { error: err.message || "stripe-error" },
      { status: 500 }
    );
  }
}
