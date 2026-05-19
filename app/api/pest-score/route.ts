import { NextResponse } from "next/server";
import { calculerPestScore, type PestScoreInput } from "@/lib/pestScore";

const TIMEOUT_MS = 5000

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Noxyera/1.0" } })
    return res
  } finally {
    clearTimeout(id)
  }
}

// ── Géocodage via Nominatim ───────────────────────────────────────────────
async function geocode(adresse: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresse)}&format=json&limit=1&countrycodes=fr`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return null
    const data = await res.json() as Array<{ lat: string; lon: string }>
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

// ── OpenWeatherMap ────────────────────────────────────────────────────────
async function fetchMeteo(lat: number, lng: number): Promise<Partial<PestScoreInput>> {
  const key = process.env.OPENWEATHER_API_KEY
  if (!key) return {}
  try {
    const [weatherRes, forecastRes] = await Promise.allSettled([
      fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric`),
      fetchWithTimeout(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${key}&units=metric`),
    ])

    let temperatureMoyenne = 15
    let humidite = 60
    let precipitations7j = 0

    if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
      const w = await weatherRes.value.json() as {
        main: { temp: number; humidity: number }
        rain?: { "1h"?: number }
      }
      temperatureMoyenne = w.main.temp
      humidite = w.main.humidity
    }

    if (forecastRes.status === "fulfilled" && forecastRes.value.ok) {
      const f = await forecastRes.value.json() as {
        list: Array<{ rain?: { "3h"?: number }; dt: number }>
      }
      // Somme des précipitations sur les 7 prochains jours (56 slots × 3h)
      precipitations7j = f.list
        .slice(0, 56)
        .reduce((acc, slot) => acc + (slot.rain?.["3h"] ?? 0), 0)
    }

    return { temperatureMoyenne, humidite, precipitations7j }
  } catch {
    return {}
  }
}

// ── Paris chantiers open data ─────────────────────────────────────────────
async function fetchChantiers(lat: number, lng: number): Promise<Partial<PestScoreInput>> {
  try {
    const base = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-perturbants/records"
    const where = encodeURIComponent(`distance(geo_point,geom'POINT(${lng} ${lat})',500m)`)
    const res = await fetchWithTimeout(`${base}?where=${where}&limit=20`)
    if (!res.ok) return {}
    const data = await res.json() as { results: Array<{ geo_point?: { lon: number; lat: number } }> }
    const chantiers = data.results ?? []

    // Distance approx en degrés (1° ≈ 111km)
    const dist = (a: { lat: number; lon: number }) =>
      Math.sqrt((a.lat - lat) ** 2 + (a.lon - lng) ** 2) * 111000

    const voirie200m   = chantiers.some(c => c.geo_point && dist(c.geo_point) < 200)
    const metro300m    = chantiers.some(c => c.geo_point && dist(c.geo_point) < 300)

    return { chantierVoirie200m: voirie200m, chantierMetro300m: metro300m }
  } catch {
    return {}
  }
}

// ── Alim'confiance ────────────────────────────────────────────────────────
async function fetchAlimconfiance(lat: number, lng: number): Promise<Partial<PestScoreInput>> {
  try {
    const base = "https://dgal.opendatasoft.com/api/explore/v2.1/catalog/datasets/export_alimconfiance/records"
    const geopoint = `GEOPOINT(${lat},${lng})`
    const where = encodeURIComponent(`geo_point_2d:distance(${geopoint},500m)`)
    const res = await fetchWithTimeout(`${base}?where=${where}&limit=30`)
    if (!res.ok) return {}
    const data = await res.json() as {
      results: Array<{
        synthese_eval_sanit?: string
        date_inspection?: string
        geo_point_2d?: { lat: number; lon: number }
      }>
    }
    const etablissements = data.results ?? []

    const dist = (a: { lat: number; lon: number }) =>
      Math.sqrt((a.lat - lat) ** 2 + (a.lon - lng) ** 2) * 111000

    const proches300m = etablissements.filter(e => e.geo_point_2d && dist(e.geo_point_2d) < 300)
    const nbARisque = proches300m.filter(e =>
      e.synthese_eval_sanit === 'A améliorer' || e.synthese_eval_sanit === 'Non satisfaisant'
    ).length

    // Contrôle DDPP récent <12 mois
    const now = Date.now()
    const controlRecent = etablissements.some(e => {
      if (!e.date_inspection) return false
      return now - new Date(e.date_inspection).getTime() < 365 * 24 * 3600 * 1000
    })

    return {
      nbEtablissementsRisqueVoisins: nbARisque,
      controleDDPP12mois: controlRecent,
    }
  } catch {
    return {}
  }
}

// ── Overpass OpenStreetMap ────────────────────────────────────────────────
async function fetchOSM(lat: number, lng: number): Promise<Partial<PestScoreInput>> {
  try {
    const query = `
[out:json][timeout:8];
(
  node[man_made=manhole](around:50,${lat},${lng});
  node[amenity~"restaurant|fast_food|cafe|bar|pub"](around:200,${lat},${lng});
  way[waterway~"river|canal|stream"](around:300,${lat},${lng});
  node[railway~"station|halt|subway_entrance"](around:500,${lat},${lng});
  node[highway=bus_stop](around:500,${lat},${lng});
);
out count;
    `.trim()

    const res = await fetchWithTimeout(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    )
    if (!res.ok) return {}

    const data = await res.json() as {
      elements: Array<{
        tags?: { man_made?: string; amenity?: string; waterway?: string; railway?: string; highway?: string }
      }>
    }

    // On compte les éléments par type
    const elements = data.elements ?? []
    const egouts    = elements.filter(e => e.tags?.man_made === "manhole").length
    const restos    = elements.filter(e => ["restaurant","fast_food","cafe","bar","pub"].includes(e.tags?.amenity ?? "")).length
    const canaux    = elements.filter(e => e.tags?.waterway).length
    const gares     = elements.filter(e => e.tags?.railway || e.tags?.["highway"] === "bus_stop").length

    return {
      proximitEgout50m: egouts > 0,
      densiteRestaurants200m: restos,
      proximiteCanal300m: canaux > 0,
      proximitéGare500m: gares > 0,
    }
  } catch {
    return {}
  }
}

// ── Extraction arrondissement Paris ──────────────────────────────────────
function extractArrondissement(adresse: string): number {
  const m = adresse.match(/750(\d{2})/) ?? adresse.match(/\b([1-9]|1\d|20)\s*(?:e|er|ème|eme)\b/i)
  if (!m) return 0
  const raw = parseInt(m[1], 10)
  return raw > 20 ? raw - 75000 : raw
}

// ── Handler principal ────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: { adresse?: unknown; nomEtablissement?: unknown; lat?: unknown; lng?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Format invalide." }, { status: 400 })
  }

  if (!body.adresse || typeof body.adresse !== "string") {
    return NextResponse.json({ message: "Adresse requise." }, { status: 400 })
  }

  const adresse = body.adresse
  const arrondissement = extractArrondissement(adresse)

  // Géocodage
  let lat = typeof body.lat === "number" ? body.lat : 0
  let lng = typeof body.lng === "number" ? body.lng : 0

  if (!lat || !lng) {
    const geo = await geocode(adresse)
    if (geo) { lat = geo.lat; lng = geo.lng }
  }

  // Appels API en parallèle (chacun avec fallback silencieux)
  const empty: Partial<PestScoreInput> = {}
  const [meteo, chantiers, alim, osm] = await Promise.all([
    lat && lng ? fetchMeteo(lat, lng)         : Promise.resolve(empty),
    lat && lng ? fetchChantiers(lat, lng)     : Promise.resolve(empty),
    lat && lng ? fetchAlimconfiance(lat, lng) : Promise.resolve(empty),
    lat && lng ? fetchOSM(lat, lng)           : Promise.resolve(empty),
  ])

  // Saison haute : juin–août
  const mois = new Date().getMonth() + 1
  const saisonHaute = mois >= 6 && mois <= 8

  // Construction de l'input avec fallbacks sensibles
  const input: PestScoreInput = {
    // Météo (fallback : conditions tempérées)
    precipitations7j:   meteo.precipitations7j   ?? 10,
    temperatureMoyenne: meteo.temperatureMoyenne  ?? 15,
    humidite:           meteo.humidite            ?? 60,

    // Travaux
    chantierVoirie200m:     chantiers.chantierVoirie200m  ?? false,
    demolitionBatiment100m: false,
    chantierMetro300m:      chantiers.chantierMetro300m   ?? false,

    // Alim'confiance
    niveauHygieneEtablissement:   'satisfaisant',
    fermetureVoisinInfraction6mois: false,
    nbEtablissementsRisqueVoisins: alim.nbEtablissementsRisqueVoisins ?? 0,
    controleDDPP12mois:             alim.controleDDPP12mois ?? false,

    // Géographie
    proximitEgout50m:      osm.proximitEgout50m       ?? false,
    densiteRestaurants200m: osm.densiteRestaurants200m ?? 5,
    ancienneteBatiment:    50,
    proximiteCanal300m:    osm.proximiteCanal300m      ?? false,
    arrondissementParis:   arrondissement,
    proximitéGare500m:     osm.proximitéGare500m       ?? false,

    // Tourisme
    evenementMajeur2km: false,
    saisonHaute,
  }

  const result = calculerPestScore(input)

  return NextResponse.json({
    ...result,
    lat,
    lng,
    adresse,
    nomEtablissement: typeof body.nomEtablissement === "string" ? body.nomEtablissement : null,
  })
}
