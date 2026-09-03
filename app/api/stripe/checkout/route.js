import { NextResponse } from "next/server";

// Crea una sesión de Stripe Checkout (suscripción). Se completa en la Fase 3d.
// Hasta que STRIPE_SECRET_KEY y STRIPE_PRICE_ID no estén en el entorno,
// responde "not-configured" para que la UI muestre un aviso claro.
export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!secret || !priceId) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  // TODO Fase 3d:
  //   - cliente supabase de servidor -> obtener user
  //   - stripe.customers list/create por email, guardar stripe_customer_id
  //   - stripe.checkout.sessions.create({ mode: "subscription", ... })
  //   - return NextResponse.json({ url: session.url })
  return NextResponse.json({ error: "not-implemented" }, { status: 501 });
}
