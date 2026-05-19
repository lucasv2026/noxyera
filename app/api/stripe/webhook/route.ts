import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    // En dev sans webhook configuré : accepter silencieusement
    console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET non configuré — webhook ignoré");
    return NextResponse.json({ received: true });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de signature";
    console.error("[stripe/webhook] Signature invalide:", message);
    return NextResponse.json({ error: `Signature invalide: ${message}` }, { status: 400 });
  }

  const supabase = await getSupabase();

  switch (event.type) {
    // ── Paiement unique (devis Sérénité custom) ──────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};

      console.log("[stripe/webhook] checkout.session.completed:", {
        id: session.id,
        mode: session.mode,
        email: session.customer_email,
        amount: session.amount_total,
        meta,
      });

      if (meta.lead_id) {
        await supabase
          .from("leads")
          .update({ statut: "signe", statut_paiement: "paye" })
          .eq("id", meta.lead_id)
          .then(({ error }) => {
            if (error) console.warn("[stripe/webhook] Lead update:", error.message);
            else console.log(`[stripe/webhook] Lead ${meta.lead_id} → signé/payé`);
          });
      }
      break;
    }

    // ── Abonnement activé ────────────────────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const meta = sub.metadata ?? {};
      const isActive = sub.status === "active" || sub.status === "trialing";

      console.log(`[stripe/webhook] ${event.type}:`, {
        id: sub.id,
        status: sub.status,
        email: (sub as Stripe.Subscription & { customer_email?: string }).customer_email,
        meta,
      });

      if (meta.lead_id && isActive) {
        await supabase
          .from("leads")
          .update({ statut: "signe", statut_paiement: "abonnement_actif" })
          .eq("id", meta.lead_id)
          .then(({ error }) => {
            if (error) console.warn("[stripe/webhook] Lead subscription update:", error.message);
          });
      }
      break;
    }

    // ── Renouvellement annuel réussi ─────────────────────────────────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceAny = invoice as Stripe.Invoice & { subscription?: string };
      console.log("[stripe/webhook] invoice.paid:", {
        id: invoice.id,
        amount: invoice.amount_paid,
        subscription: invoiceAny.subscription,
      });
      // Ici on pourrait envoyer un email de confirmation de renouvellement via Resend
      break;
    }

    // ── Paiement échoué ──────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
      console.error("[stripe/webhook] invoice.payment_failed:", {
        id: invoice.id,
        subscription: invoice.subscription,
      });
      // Ici on enverrait une alerte email au client et à l'admin
      break;
    }

    default:
      // Ignorer les événements non gérés
      break;
  }

  return NextResponse.json({ received: true });
}
