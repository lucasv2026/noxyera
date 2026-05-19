import { NextResponse } from "next/server";

const TIMEOUT_MS = 4000

async function fetchT(url: string, headers: Record<string, string> = {}): Promise<Response> {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Noxyera/1.0", ...headers },
    })
  } finally {
    clearTimeout(id)
  }
}

interface EtablissementResult {
  nom: string
  adresse: string
  siret?: string
  lat?: number
  lng?: number
}

// ── Recherche via Alim'confiance (DGAL) ──────────────────────────────────
async function searchAlimconfiance(query: string): Promise<EtablissementResult[]> {
  try {
    const where = encodeURIComponent(`app_libelle_activite_etablissement LIKE "${query}%" OR libelle_commune LIKE "${query}%"`)
    const url = `https://dgal.opendatasoft.com/api/explore/v2.1/catalog/datasets/export_alimconfiance/records?where=${where}&limit=8&select=app_libelle_etablissement,adresse_2_ua,libelle_commune,code_postal,geo_point_2d`
    const res = await fetchT(url)
    if (!res.ok) return []
    const data = await res.json() as {
      results: Array<{
        app_libelle_etablissement?: string
        adresse_2_ua?: string
        libelle_commune?: string
        code_postal?: string
        geo_point_2d?: { lat: number; lon: number }
      }>
    }
    return (data.results ?? []).map(r => ({
      nom:    r.app_libelle_etablissement ?? "Établissement",
      adresse: [r.adresse_2_ua, r.code_postal, r.libelle_commune].filter(Boolean).join(", "),
      lat:    r.geo_point_2d?.lat,
      lng:    r.geo_point_2d?.lon,
    }))
  } catch {
    return []
  }
}

// ── Fallback : géocodage Nominatim (adresse libre) ────────────────────────
async function searchNominatim(query: string): Promise<EtablissementResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr&addressdetails=1`
    const res = await fetchT(url)
    if (!res.ok) return []
    const data = await res.json() as Array<{
      display_name: string
      lat: string
      lon: string
      address?: { road?: string; postcode?: string; city?: string; town?: string }
    }>
    return data.map(r => ({
      nom:    r.display_name.split(",")[0],
      adresse: r.display_name,
      lat:    parseFloat(r.lat),
      lng:    parseFloat(r.lon),
    }))
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.trim()

  if (!query || query.length < 3) {
    return NextResponse.json([])
  }

  // Appels parallèles : Alim'confiance + Nominatim
  const [alim, nominatim] = await Promise.all([
    searchAlimconfiance(query),
    searchNominatim(query),
  ])

  // Merge : alim'confiance en priorité, puis nominatim, dédupliqué par adresse
  const seen = new Set<string>()
  const results: EtablissementResult[] = []

  for (const r of [...alim, ...nominatim]) {
    const key = r.adresse.slice(0, 30).toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      results.push(r)
      if (results.length >= 8) break
    }
  }

  return NextResponse.json(results)
}
