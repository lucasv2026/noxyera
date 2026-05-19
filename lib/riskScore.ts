import type { Secteur } from './pricing'

interface RiskParams {
  secteur: Secteur
  arrondissement?: number
}

const BASE_RISK: Record<Secteur, number> = {
  restaurant:      7,
  hotel:           6,
  entrepot:        8,
  agroalimentaire: 9,
  immeuble:        5,
  bureau:          3,
}

const ZONE_MULTIPLIER: Record<number, number> = {
  1:  0.9,  2: 0.85,  3: 0.95,  4: 1.0,   5: 1.1,
  6:  0.9,  7: 0.8,   8: 0.85,  9: 1.1,  10: 1.2,
  11: 1.3, 12: 1.1,  13: 1.2,  14: 1.0,  15: 1.15,
  16: 0.7, 17: 0.9,  18: 1.4,  19: 1.3,  20: 1.35,
}

export function calculerScoreRisque(params: RiskParams): {
  score: number
  niveau: 'faible' | 'modere' | 'eleve' | 'critique'
  message: string
} {
  const base = BASE_RISK[params.secteur]
  const multiplier = params.arrondissement
    ? (ZONE_MULTIPLIER[params.arrondissement] ?? 1.0)
    : 1.0
  const score = Math.min(10, Math.round(base * multiplier * 10) / 10)
  const niveau = score < 4 ? 'faible' : score < 6 ? 'modere' : score < 8 ? 'eleve' : 'critique'
  const messages = {
    faible:   'Risque limité. Un contrat préventif trimestriel suffit.',
    modere:   'Risque modéré. Des contrôles DDPP sont possibles dans votre secteur.',
    eleve:    'Risque élevé. Plusieurs établissements proches ont été contrôlés ce trimestre.',
    critique: 'Risque critique. Votre zone est classée prioritaire par les services sanitaires.',
  }
  return { score, niveau, message: messages[niveau] }
}
