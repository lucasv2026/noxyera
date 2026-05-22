import { createClient } from '@supabase/supabase-js'

// ─── Config ────────────────────────────────────────────────────────────────
const BASE_URL    = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET    ?? ''
const supabase    = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Utilitaires ───────────────────────────────────────────────────────────
let passed = 0
let failed = 0

async function check(label: string, fn: () => Promise<boolean>): Promise<void> {
  try {
    const ok = await fn()
    if (ok) {
      console.log(`  ✅  ${label}`)
      passed++
    } else {
      console.log(`  ❌  ${label}`)
      failed++
    }
  } catch (err) {
    console.log(`  ❌  ${label} — ERREUR: ${err}`)
    failed++
  }
}

async function post(path: string, body: unknown, headers?: Record<string, string>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}

async function get(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}

// ─── Données de test ───────────────────────────────────────────────────────
async function seedTestSite() {
  const { data: tech } = await supabase
    .from('profiles')
    .select('id, user_id, email, prenom, nom')
    .eq('role', 'technicien')
    .limit(1)
    .maybeSingle()

  const { data: client } = await supabase
    .from('profiles')
    .select('id, user_id, email, prenom')
    .eq('role', 'client')
    .limit(1)
    .maybeSingle()

  const { data: site } = await supabase
    .from('sites')
    .select('id, nom')
    .limit(1)
    .maybeSingle()

  return { tech, client, site }
}

// ─── FLUX 1 : Soumission formulaire audit (C2) ─────────────────────────────
async function testAuditSubmission() {
  console.log('\n📋 FLUX 1 — Soumission audit (email C2)')

  await check('POST /api/audit retourne 200', async () => {
    const { status } = await post('/api/audit', {
      nom_etablissement: 'Hôtel Test Smoke',
      adresse: '12 rue de la Paix, Paris',
      secteur: 'hotel',
      superficie: 500,
      prenom: 'Test',
      nom: 'Smoke',
      email: 'smoke@noxyera-test.com',
      telephone: '0600000000',
      creneaux: ['matin'],
      jours: ['lundi'],
    })
    return status === 200
  })

  await check('Lead créé dans la table audits', async () => {
    const { data } = await supabase
      .from('audits')
      .select('id, statut')
      .eq('email', 'smoke@noxyera-test.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.statut === 'nouveau'
  })

  // Nettoyage
  await supabase.from('audits').delete().eq('email', 'smoke@noxyera-test.com')
}

// ─── FLUX 2 : Machine à états mission ─────────────────────────────────────
async function testMissionStateMachine() {
  console.log('\n⚙️  FLUX 2 — Machine à états mission')

  const { tech, site } = await seedTestSite()

  if (!tech || !site) {
    console.log('  ⚠️  Pas de technicien ou de site en base — flux ignoré')
    return
  }

  // Créer une intervention de test
  const { data: intervention } = await supabase
    .from('interventions')
    .insert({
      site_id:      site.id,
      technicien_id: null,
      statut:       'planifie',
      type:         'preventif',
      date_prevue:  new Date(Date.now() + 86_400_000).toISOString(),
    })
    .select('id')
    .single()

  if (!intervention) {
    console.log('  ⚠️  Impossible de créer l\'intervention de test — flux ignoré')
    return
  }

  const id = intervention.id

  // Offrir
  await check('POST /api/admin/missions/[id]/offrir → 200', async () => {
    const { status } = await post(`/api/admin/missions/${id}/offrir`, { technicienId: tech.id })
    return status === 200
  })

  await check('Statut → proposee + offered_at + expires_at + technicien_id', async () => {
    const { data } = await supabase
      .from('interventions')
      .select('statut, offered_at, expires_at, technicien_id')
      .eq('id', id)
      .single()
    return (
      data?.statut        === 'proposee' &&
      data?.offered_at    !== null &&
      data?.expires_at    !== null &&
      data?.technicien_id === tech.id
    )
  })

  await check('expires_at = offered_at + 24h (±1 min)', async () => {
    const { data } = await supabase
      .from('interventions')
      .select('offered_at, expires_at')
      .eq('id', id)
      .single()
    if (!data) return false
    const diff = new Date(data.expires_at).getTime() - new Date(data.offered_at).getTime()
    return Math.abs(diff - 24 * 60 * 60 * 1000) < 60_000
  })

  // Refuser
  await check('POST /api/technicien/missions/[id]/refuse → 200', async () => {
    const { status } = await post(`/api/technicien/missions/${id}/refuse`, {})
    return status === 200
  })

  await check('Statut → proposee + technicien_id null + refused_at après refus', async () => {
    const { data } = await supabase
      .from('interventions')
      .select('statut, technicien_id, refused_at')
      .eq('id', id)
      .single()
    return (
      data?.statut        === 'proposee' &&
      data?.technicien_id === null &&
      data?.refused_at    !== null
    )
  })

  // Re-proposer pour tester l'acceptation
  await supabase
    .from('interventions')
    .update({ technicien_id: tech.id, statut: 'proposee', refused_at: null })
    .eq('id', id)

  await check('POST /api/technicien/missions/[id]/accept → 200', async () => {
    const { status } = await post(`/api/technicien/missions/${id}/accept`, {})
    return status === 200
  })

  await check('Statut → planifie + accepted_at après acceptation', async () => {
    const { data } = await supabase
      .from('interventions')
      .select('statut, accepted_at')
      .eq('id', id)
      .single()
    return data?.statut === 'planifie' && data?.accepted_at !== null
  })

  // Nettoyage
  await supabase.from('interventions').delete().eq('id', id)
}

// ─── FLUX 3 : Cron expiration ──────────────────────────────────────────────
async function testCronExpiration() {
  console.log('\n⏰ FLUX 3 — Cron expiration missions')

  const { site } = await seedTestSite()
  if (!site) {
    console.log('  ⚠️  Pas de site en base — flux ignoré')
    return
  }

  // Créer une intervention déjà expirée
  const { data: intervention } = await supabase
    .from('interventions')
    .insert({
      site_id:      site.id,
      statut:       'proposee',
      type:         'preventif',
      date_prevue:  new Date(Date.now() + 86_400_000).toISOString(),
      offered_at:   new Date(Date.now() - 25 * 3_600_000).toISOString(), // il y a 25h
      expires_at:   new Date(Date.now() -      3_600_000).toISOString(), // expiré il y a 1h
    })
    .select('id')
    .single()

  if (!intervention) {
    console.log('  ⚠️  Impossible de créer l\'intervention expirée de test — flux ignoré')
    return
  }

  await check('GET /api/cron/expire-missions sans secret → 401', async () => {
    const { status } = await get('/api/cron/expire-missions')
    return status === 401
  })

  await check('GET /api/cron/expire-missions avec CRON_SECRET → 200', async () => {
    const { status, data } = await get('/api/cron/expire-missions', {
      Authorization: `Bearer ${CRON_SECRET}`,
    })
    return status === 200 && typeof data.expired === 'number'
  })

  await check('Intervention passée à statut expire en base', async () => {
    const { data } = await supabase
      .from('interventions')
      .select('statut')
      .eq('id', intervention.id)
      .single()
    return data?.statut === 'expire'
  })

  // Nettoyage
  await supabase.from('interventions').delete().eq('id', intervention.id)
}

// ─── FLUX 4 : Validation body routes API ──────────────────────────────────
async function testInviteFlow() {
  console.log('\n📨 FLUX 4 — Validation body routes API')

  await check('POST /api/admin/valider-technicien sans body → ≥ 400', async () => {
    const { status } = await post('/api/admin/valider-technicien', {})
    return status >= 400
  })

  await check('POST /api/audit sans champs obligatoires → 400', async () => {
    const { status } = await post('/api/audit', { nom_etablissement: 'Test incomplet' })
    return status === 400
  })

  await check('POST /api/admin/missions/fake-id/offrir sans technicienId → 400', async () => {
    const { status } = await post('/api/admin/missions/fake-id/offrir', {})
    return status === 400
  })

  await check('GET /admin-noxyera/login répond 200 (page accessible)', async () => {
    const res = await fetch(`${BASE_URL}/admin-noxyera/login`)
    return res.status === 200
  })

  await check('GET /login répond 200 (espace client accessible)', async () => {
    const res = await fetch(`${BASE_URL}/login`)
    return res.status === 200
  })
}

// ─── RAPPORT FINAL ─────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  Noxyera — Smoke Tests')
  console.log(`    Base URL  : ${BASE_URL}`)
  console.log(`    Supabase  : ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(non défini)'}`)
  console.log(`    Cron      : ${CRON_SECRET ? '✓ défini' : '⚠ absent — FLUX 3 partiel'}`)
  console.log('')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌  Variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes dans .env.local')
    process.exit(1)
  }

  await testAuditSubmission()
  await testMissionStateMachine()
  await testCronExpiration()
  await testInviteFlow()

  console.log(`\n${'─'.repeat(44)}`)
  console.log(`  ✅  ${passed} test${passed !== 1 ? 's' : ''} passé${passed !== 1 ? 's' : ''}`)
  if (failed > 0) {
    console.log(`  ❌  ${failed} test${failed !== 1 ? 's' : ''} échoué${failed !== 1 ? 's' : ''}`)
    process.exit(1)
  } else {
    console.log('  🎉  Tous les flux critiques sont opérationnels')
    process.exit(0)
  }
}

main()
