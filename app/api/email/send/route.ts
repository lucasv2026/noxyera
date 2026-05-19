import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  emailIntervention7j,
  emailRapportDisponible,
  emailNouveauLead,
} from '@/lib/email/templates'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const LUCAS_EMAIL = 'lucas@agencenikita.com'

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key not configured' },
      { status: 500 }
    )
  }

  let body: { type: string; data: Record<string, unknown> }

  try {
    body = (await request.json()) as { type: string; data: Record<string, unknown> }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { type, data } = body

  if (!type || !data) {
    return NextResponse.json(
      { success: false, error: 'Missing type or data' },
      { status: 400 }
    )
  }

  try {
    const resend = new Resend(apiKey)

    if (type === 'intervention_j7') {
      const params = {
        clientNom: String(data.clientNom ?? ''),
        siteNom: String(data.siteNom ?? ''),
        adresse: String(data.adresse ?? ''),
        dateIntervention: String(data.dateIntervention ?? ''),
        technicienNom: String(data.technicienNom ?? ''),
      }
      const toEmail = String(data.email ?? '')
      if (!toEmail || !toEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid recipient email' },
          { status: 400 }
        )
      }
      const template = emailIntervention7j(params)
      const { data: result, error } = await resend.emails.send({
        from: `Noxyera <${FROM_EMAIL}>`,
        to: toEmail,
        subject: template.subject,
        html: template.html,
      })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, messageId: result?.id })
    }

    if (type === 'rapport_disponible') {
      const params = {
        clientNom: String(data.clientNom ?? ''),
        siteNom: String(data.siteNom ?? ''),
        dateIntervention: String(data.dateIntervention ?? ''),
        pdfUrl: String(data.pdfUrl ?? ''),
        numeroRapport: String(data.numeroRapport ?? ''),
        haccpConforme: Boolean(data.haccpConforme),
      }
      const toEmail = String(data.email ?? '')
      if (!toEmail || !toEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid recipient email' },
          { status: 400 }
        )
      }
      const template = emailRapportDisponible(params)
      const { data: result, error } = await resend.emails.send({
        from: `Noxyera <${FROM_EMAIL}>`,
        to: toEmail,
        subject: template.subject,
        html: template.html,
      })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, messageId: result?.id })
    }

    if (type === 'nouveau_lead') {
      const params = {
        email: String(data.email ?? ''),
        secteur: String(data.secteur ?? ''),
        superficie: Number(data.superficie ?? 0),
        prixEstime: Number(data.prixEstime ?? data.prix_estime ?? 0),
        formuleSuggeree: String(data.formuleSuggeree ?? data.formule_suggeree ?? ''),
        scoreGlobal: typeof data.scoreGlobal === 'number'
          ? data.scoreGlobal
          : typeof data.score_risque === 'number'
          ? data.score_risque
          : undefined,
        nomEtablissement: data.nomEtablissement ? String(data.nomEtablissement) : undefined,
      }
      const template = emailNouveauLead(params)
      const { data: result, error } = await resend.emails.send({
        from: `Noxyera <${FROM_EMAIL}>`,
        to: LUCAS_EMAIL,
        subject: template.subject,
        html: template.html,
      })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, messageId: result?.id })
    }

    return NextResponse.json(
      { success: false, error: `Unknown email type: ${type}` },
      { status: 400 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
