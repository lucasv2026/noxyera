import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

// ── Paramètres checkout (prix dynamique par client) ───────────────────────
export interface CheckoutParams {
  email: string
  montantCentimes: number       // calculé par l'estimateur côté client
  description: string           // ex: "Contrat annuel Essentiel — Brasserie Voltaire"
  formule: "essentiel" | "serenite" | "devis"
  metadata: Record<string, string>  // { site_nom, formule, lead_id, superficie, ... }
  successUrl: string
  cancelUrl: string
}

/**
 * Crée une session Stripe Checkout en mode `subscription` avec un prix
 * dynamique (price_data + recurring annuel). Le montant est calculé en
 * amont par l'estimateur Noxyera et varie par client.
 */
export async function creerCheckoutSession(params: CheckoutParams): Promise<string> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe non configuré — ajoutez STRIPE_SECRET_KEY dans .env.local");
  }

  if (params.montantCentimes < 50000) {
    throw new Error("Montant minimum 500 € (50 000 centimes)");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: params.description,
            metadata: { formule: params.formule },
          },
          unit_amount: params.montantCentimes,
          recurring: { interval: "year" },
        },
        quantity: 1,
      },
    ],
    metadata: params.metadata,
    subscription_data: {
      metadata: params.metadata,
    },
    payment_method_types: ["card"],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    locale: "fr",
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas retourné d'URL de paiement");
  }

  return session.url;
}
