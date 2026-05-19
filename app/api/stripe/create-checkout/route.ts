import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { priceId, clientEmail, clientNom, successUrl, cancelUrl } = await req.json()

  // Vérifie si STRIPE_SECRET_KEY est défini
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_placeholder') {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 503 })
  }

  try {
    // Cherche ou crée le customer Stripe
    const customers = await stripe.customers.list({ email: clientEmail, limit: 1 })
    let customer = customers.data[0]
    if (!customer) {
      customer = await stripe.customers.create({ email: clientEmail, name: clientNom })
    }

    // Crée la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscription=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL}/tarifs`,
      locale: 'fr',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
