export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import { HaccpPdfDocument, HaccpPdfProps } from '@/lib/pdf/haccp-template'

interface GenerateRequestBody extends Omit<HaccpPdfProps, 'numeroRapport'> {
  interventionId: string
  email?: string  // optional — used to send notification email to client
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequestBody = await request.json()

    const {
      interventionId,
      id,
      siteNom,
      adresse,
      technicienNom,
      technicienCertif,
      dateIntervention,
      type,
      zonesTraitees,
      produitsUtilises,
      notes,
      haccpConforme,
    } = body

    // Generate rapport number
    const year = new Date().getFullYear()
    const numeroRapport = `NXR-${year}-${id.slice(0, 8).toUpperCase()}`

    // Build props for the PDF
    const pdfProps: HaccpPdfProps = {
      id,
      siteNom,
      adresse,
      technicienNom,
      technicienCertif,
      dateIntervention,
      type,
      zonesTraitees: zonesTraitees ?? [],
      produitsUtilises: produitsUtilises ?? [],
      notes: notes ?? '',
      haccpConforme: haccpConforme ?? true,
      numeroRapport,
    }

    // Generate PDF buffer — react-pdf types mismatch with React 18, cast needed
    /* eslint-disable-next-line */
    const pdfBuffer = await renderToBuffer(React.createElement(HaccpPdfDocument, pdfProps) as never)

    // Initialise Supabase with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const storagePath = `rapports/${interventionId}/${numeroRapport}.pdf`

    // Upload to Supabase Storage
    let pdfUrl: string | null = null

    const { error: uploadError } = await supabase.storage
      .from('haccp-reports')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('[rapport/generate] Storage upload error:', uploadError)
      // Fallback: return base64 data URL
      const base64 = Buffer.from(pdfBuffer).toString('base64')
      pdfUrl = `data:application/pdf;base64,${base64}`
    } else {
      // Get signed URL (valid for 1 year)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('haccp-reports')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

      if (signedError || !signedData?.signedUrl) {
        console.error('[rapport/generate] Signed URL error:', signedError)
        // Fallback to base64
        const base64 = Buffer.from(pdfBuffer).toString('base64')
        pdfUrl = `data:application/pdf;base64,${base64}`
      } else {
        pdfUrl = signedData.signedUrl
      }
    }

    // Insert rapport record into rapports table
    const { data: rapportData, error: insertError } = await supabase
      .from('rapports')
      .insert({
        intervention_id: interventionId,
        technicien_id: null,
        pdf_url: pdfUrl,
        produits_utilises: produitsUtilises ?? [],
        zones_traitees: zonesTraitees ?? [],
        haccp_conforme: haccpConforme ?? true,
        signe_le: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[rapport/generate] Insert error:', insertError)
      // Non-fatal: return the URL even if DB insert fails
      return NextResponse.json(
        {
          pdfUrl,
          rapportId: null,
          warning: 'PDF généré mais non enregistré en base de données.',
        },
        { status: 200 }
      )
    }

    // Fire email notification to client — non-blocking
    if (body.email && typeof body.email === 'string' && pdfUrl) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
      fetch(`${siteUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rapport_disponible',
          data: {
            email: body.email,
            clientNom: body.siteNom,
            siteNom: body.siteNom,
            dateIntervention: body.dateIntervention,
            pdfUrl,
            numeroRapport,
            haccpConforme: body.haccpConforme ?? true,
          }
        })
      }).catch(() => {}) // non-blocking
    }

    return NextResponse.json({
      pdfUrl,
      rapportId: rapportData?.id ?? null,
    })
  } catch (err) {
    console.error('[rapport/generate] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport PDF.' },
      { status: 500 }
    )
  }
}
