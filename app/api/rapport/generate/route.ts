export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import { HaccpPdfDocument } from '@/lib/pdf/haccp-template'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      interventionId,
      technicienId,
      zonesTraitees = [],
      produitsUtilises = [],
      observations = '',
      presenceActive = false,
      recommandationSuivi = false,
      photosUrl = [],
      signatureDataUrl,
      siteName,
      siteAdresse,
      secteur,
      type: rawType,
      formule,
      frequence,
      technicienNom = 'Technicien Noxyera',
      datePrevue,
    } = body

    // Type réel selon présence active
    const type = presenceActive ? 'curatif' : (rawType ?? 'preventif')

    // N° rapport
    const year = new Date().getFullYear()
    const shortId = (interventionId ?? 'DEMO').slice(0, 8).toUpperCase()
    const numeroRapport = `NXR-${year}-${shortId}`

    const dateIntervention = new Date().toISOString()

    // Observations enrichies
    const notesComplet = [
      observations,
      presenceActive ? '⚠ Présence active détectée lors de cette intervention.' : '',
      recommandationSuivi ? '➜ Recommandation : suivi à planifier sous 15 jours.' : '',
    ].filter(Boolean).join('\n\n')

    // Génération PDF
    const pdfProps = {
      id: interventionId ?? 'DEMO',
      siteNom: siteName ?? '—',
      adresse: siteAdresse ?? '—',
      technicienNom,
      technicienCertif: 'CERT-NXR-2024-001',
      dateIntervention,
      type: type as 'preventif' | 'curatif' | 'urgence',
      zonesTraitees,
      produitsUtilises,
      notes: notesComplet,
      haccpConforme: !presenceActive,
      numeroRapport,
    }

    /* eslint-disable-next-line */
    const pdfBuffer = await renderToBuffer(React.createElement(HaccpPdfDocument, pdfProps) as never)

    // Supabase service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload PDF → bucket 'rapports'
    let pdfUrl: string | null = null
    const storagePath = `${interventionId ?? 'demo'}/${numeroRapport}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('rapports')
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (!uploadError) {
      const { data: publicData } = supabase.storage.from('rapports').getPublicUrl(storagePath)
      pdfUrl = publicData?.publicUrl ?? null
    }

    // Fallback base64 si storage indisponible
    if (!pdfUrl) {
      const base64 = Buffer.from(pdfBuffer).toString('base64')
      pdfUrl = `data:application/pdf;base64,${base64}`
    }

    // INSERT rapport
    const { data: rapportData, error: insertError } = await supabase
      .from('rapports')
      .insert({
        intervention_id: interventionId,
        technicien_id: technicienId ?? null,
        pdf_url: pdfUrl,
        zones_traitees: zonesTraitees,
        produits_utilises: produitsUtilises,
        photos_url: photosUrl,
        haccp_conforme: !presenceActive,
        signe_le: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle()

    if (insertError) {
      console.error('[rapport/generate] INSERT error:', insertError)
    }

    // UPDATE intervention → realise
    const { error: updateError } = await supabase
      .from('interventions')
      .update({ statut: 'realise', date_reelle: new Date().toISOString() })
      .eq('id', interventionId)

    if (updateError) {
      console.error('[rapport/generate] UPDATE intervention error:', updateError)
    }

    // Email client — récupère l'email via sites → profiles
    try {
      const { data: intervention } = await supabase
        .from('interventions')
        .select('site_id')
        .eq('id', interventionId)
        .maybeSingle()

      if (intervention?.site_id) {
        const { data: site } = await supabase
          .from('sites')
          .select('client_id, nom')
          .eq('id', intervention.site_id)
          .maybeSingle()

        if (site?.client_id) {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('email, prenom, nom')
            .eq('id', site.client_id)
            .maybeSingle()

          if (clientProfile?.email) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noxyera.com'
            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            await resend.emails.send({
              from: 'Noxyera Rapports <rapports@noxyera.com>',
              to: clientProfile.email,
              subject: `Rapport HACCP disponible — ${site.nom ?? siteName}`,
              html: `
                <p>Bonjour ${clientProfile.prenom ?? ''},</p>
                <p>Votre rapport d'intervention du <strong>${dateStr}</strong> est disponible sur votre espace client.</p>
                <p>
                  <a href="${siteUrl}/dashboard/rapports" style="display:inline-block;padding:12px 24px;background:#1B3A2D;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Télécharger le rapport →
                  </a>
                </p>
                <p style="color:#9CA3AF;font-size:12px;">Noxyera — Hygiène & Dératisation professionnelle</p>
              `,
            })
          }
        }
      }
    } catch (emailErr) {
      console.error('[rapport/generate] Email error (non-fatal):', emailErr)
    }

    return NextResponse.json({
      pdfUrl,
      rapportId: rapportData?.id ?? null,
      numeroRapport,
    })
  } catch (err) {
    console.error('[rapport/generate] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport PDF.' },
      { status: 500 }
    )
  }
}
