import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";
import { getStripe, isStripeConfigured, STRIPE_PRICE_ID } from "../../../../lib/stripe";

export const runtime = "nodejs";

// Crea una sesión de Stripe Checkout (suscripción) para el usuario logueado.
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

  const stripe = getStripe();
  const origin = new URL(request.url).origin;

  try {
    // Reutiliza el customer de Stripe si ya existe para este usuario.
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/precios?checkout=success`,
      cancel_url: `${origin}/precios?checkout=cancel`,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      client_reference_id: user.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err);
    return NextResponse.json(
      { error: err.message || "stripe-error" },
      { status: 500 }
    );
  }
}
