import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const [leadsRes, candidaturesRes, profilesRes] = await Promise.all([
      supabase
        .from('leads')
        .select('id, email, nom_etablissement, secteur, created_at, statut')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('candidatures_techniciens')
        .select('id, prenom, nom, email, ville, certifications, statut, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('profiles')
        .select('id, prenom, nom, email, role, ville, disponibilite, certifications, actif, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    const profiles = profilesRes.data ?? []
    const profiles_clients = profiles.filter(p => p.role === 'client')
    const profiles_techniciens = profiles.filter(p => p.role === 'technicien')

    return NextResponse.json({
      leads: leadsRes.data ?? [],
      candidatures: candidaturesRes.data ?? [],
      profiles_clients,
      profiles_techniciens,
    })
  } catch (err) {
    console.error('CRM GET error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, type, statut } = body

    if (!id || !type || !statut) {
      return NextResponse.json({ error: 'id, type et statut requis' }, { status: 400 })
    }

    const supabase = getSupabase()

    if (type === 'lead') {
      const { error } = await supabase
        .from('leads')
        .update({ statut })
        .eq('id', id)
      if (error) throw error
    } else if (type === 'candidature') {
      const { error } = await supabase
        .from('candidatures_techniciens')
        .update({ statut })
        .eq('id', id)
      if (error) throw error
    } else {
      return NextResponse.json({ error: 'type invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CRM PATCH error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
