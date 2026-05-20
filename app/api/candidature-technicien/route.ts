import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rateLimit'
import * as Sentry from '@sentry/nextjs'

const CandidatureSchema = z.object({
  prenom: z.string().min(2),
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(10),
  ville: z.string().min(2),
  code_postal: z.string().length(5),
  experience: z.enum(['0-1an', '1-3ans', '3-5ans', '5ans+']),
  certifications: z.array(z.string()).optional(),
  vehicule: z.boolean(),
  disponibilite: z.enum(['temps-plein', 'temps-partiel', 'week-ends', 'flexible']),
  motivation: z.string().max(1000).optional(),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!rateLimit(ip, 5, 60_000)) {
      return Response.json({ error: 'Trop de requêtes. Réessayez dans 1 minute.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = CandidatureSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // DEMO_MODE
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      console.log('[Demo] Candidature technicien:', data.prenom, data.nom, data.email)
      return NextResponse.json({ success: true, demo: true })
    }

    // Insert into Supabase
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      await supabase.from('candidatures_techniciens').insert({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville,
        code_postal: data.code_postal,
        experience: data.experience,
        certifications: data.certifications ?? [],
        vehicule: data.vehicule,
        disponibilite: data.disponibilite,
        motivation: data.motivation ?? null,
        statut: 'nouveau',
      })
    } catch (dbErr) {
      Sentry.captureException(dbErr)
    }

    // Send notification email
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Noxyera <bonjour@noxyera.com>',
          to: 'recrutement@noxyera.com',
          subject: `Nouvelle candidature technicien — ${data.prenom} ${data.nom}`,
          html: `<p>Nouvelle candidature de ${data.prenom} ${data.nom}</p><p>Email: ${data.email}</p><p>Ville: ${data.ville} (${data.code_postal})</p><p>Expérience: ${data.experience}</p><p>Disponibilité: ${data.disponibilite}</p><p>Motivation: ${data.motivation || 'Non renseignée'}</p>`,
        })
      }
    } catch (emailErr) {
      Sentry.captureException(emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
