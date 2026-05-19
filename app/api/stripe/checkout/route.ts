import { NextRequest, NextResponse } from "next/server";
import { creerCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe non configuré — ajoutez STRIPE_SECRET_KEY dans .env.local" },
      { status: 503 }
    );
  }

  let body: {
    email?: unknown;
    montant?: unknown;        // en centimes, calculé par l'estimateur
    description?: unknown;
    formule?: unknown;
    metadata?: unknown;
    successUrl?: unknown;
    cancelUrl?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.email || typeof body.email !== "string") {
    return NextResponse.json({ error: "email requis" }, { status: 400 });
  }

  const montant = typeof body.montant === "number" ? body.montant : 0;
  if (montant < 50000) {
    return NextResponse.json(
      { error: "montant invalide — minimum 500 € (50 000 centimes)" },
      { status: 400 }
    );
  }

  const formule = body.formule === "essentiel" || body.formule === "serenite"
    ? body.formule
    : "devis" as const;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const meta =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, string>)
      : {};

  try {
    const url = await creerCheckoutSession({
      email: body.email,
      montantCentimes: montant,
      description:
        typeof body.description === "string"
          ? body.description
          : `Contrat annuel Noxyera${formule !== "devis" ? ` — ${formule.charAt(0).toUpperCase() + formule.slice(1)}` : ""}`,
      formule,
      metadata: meta,
      successUrl:
        typeof body.successUrl === "string"
          ? body.successUrl
          : `${base}/dashboard?abonnement=success`,
      cancelUrl:
        typeof body.cancelUrl === "string"
          ? body.cancelUrl
          : `${base}/tarifs`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
