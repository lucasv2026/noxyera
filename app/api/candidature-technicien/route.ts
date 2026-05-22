import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rateLimit'
import * as Sentry from '@sentry/nextjs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    console.log('CANDIDATURE RECEIVED:', JSON.stringify(body))

    const parsed = CandidatureSchema.safeParse(body)
    if (!parsed.success) {
      console.error('CANDIDATURE VALIDATION ERROR:', JSON.stringify(parsed.error.flatten()))
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
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      )
      const { error: dbError } = await supabase.from('candidatures_techniciens').insert({
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
      if (dbError) console.error('CANDIDATURE DB ERROR:', JSON.stringify(dbError))
      else console.log('CANDIDATURE SAVED OK')
    } catch (dbErr) {
      console.error('CANDIDATURE DB EXCEPTION:', dbErr)
      Sentry.captureException(dbErr)
    }

    // Email notif admin — toujours envoyé même si Supabase échoue
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Noxyera <onboarding@resend.dev>',
          to: 'lucas@agencenikita.com',
          subject: `🧑‍🔧 Nouveau technicien candidat — ${data.prenom} ${data.nom}`,
          html: `<p><strong>Prénom :</strong> ${data.prenom} ${data.nom}</p>
                 <p><strong>Email :</strong> ${data.email}</p>
                 <p><strong>Téléphone :</strong> ${data.telephone}</p>
                 <p><strong>Ville :</strong> ${data.ville} (${data.code_postal})</p>
                 <p><strong>Expérience :</strong> ${data.experience}</p>
                 <p><strong>Disponibilité :</strong> ${data.disponibilite}</p>
                 <p><strong>Véhicule :</strong> ${data.vehicule ? 'Oui' : 'Non'}</p>
                 ${data.certifications?.length ? `<p><strong>Certifications :</strong> ${data.certifications.join(', ')}</p>` : ''}
                 ${data.motivation ? `<p><strong>Motivation :</strong> ${data.motivation}</p>` : ''}`,
        })
        console.log('EMAIL CANDIDATURE ADMIN SENT')
      }
    } catch (emailAdminErr) {
      console.error('EMAIL CANDIDATURE ADMIN ERROR:', emailAdminErr)
    }

    // Email confirmation au candidat
    try {
      const { sendCandidatureConfirmEmail } = await import('@/lib/emails')
      await sendCandidatureConfirmEmail(data.email, {
        prenom:         data.prenom,
        nom:            data.nom,
        telephone:      data.telephone,
        ville:          data.ville,
        code_postal:    data.code_postal,
        experience:     data.experience,
        certifications: data.certifications,
        vehicule:       data.vehicule,
        disponibilite:  data.disponibilite,
        motivation:     data.motivation,
      })
    } catch (emailErr) {
      console.error('EMAIL CANDIDATURE CONFIRM ERROR:', emailErr)
      Sentry.captureException(emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
