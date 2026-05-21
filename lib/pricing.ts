export type Secteur = 'restaurant' | 'hotel' | 'entrepot' | 'agroalimentaire' | 'immeuble' | 'bureau'
export type Nuisible = 'rongeurs' | 'insectes' | 'multi'
export type Frequence = 4 | 6 | 12
export type Formule = 'essentiel' | 'serenite'

export interface PricingParams {
  secteur: Secteur
  superficie: number
  frequence: Frequence
  nuisible: Nuisible
  formule: Formule
  distanceKm?: number
}

// ── Paramètres financiers ────────────────────────────────────────────────────
const TAUX_HORAIRE_TECHNICIEN = 52        // €/h — tarif certifié Certibiocide
const COUT_KM = 0.52
const CHARGES_SOCIALES = 0.22
const MARGE_NOXYERA = 0.38
const DISTANCE_DEFAULT = 25

// ── Durée de passage selon superficie ───────────────────────────────────────
function getDureePassage(superficie: number): number {
  if (superficie <   200) return 1.5   // petit local / restaurant
  if (superficie <   500) return 2.5   // moyen
  if (superficie <  1000) return 3.5   // grand restaurant / hôtel moyen
  if (superficie <  2500) return 5.0   // grand hôtel / petit entrepôt
  if (superficie <  5000) return 7.0   // entrepôt moyen
  if (superficie < 12000) return 10.0  // grand entrepôt / IAA
  if (superficie < 30000) return 14.0  // très grand site
  return 20.0                           // site industriel majeur
}

// ── Multiplicateur par secteur (complexité règlementaire + risque) ───────────
const MULTIPLICATEUR_SECTEUR: Record<Secteur, number> = {
  restaurant:      1.0,   // standard
  hotel:           1.15,  // multi-espaces, piscine, SPA
  entrepot:        1.20,  // réglementation stockage, hauteur
  agroalimentaire: 1.45,  // agréments sanitaires stricts, bilan biocides
  immeuble:        1.05,  // parties communes + caves
  bureau:          0.90,  // risque plus faible
}

// ── Coût matériel par type de nuisible ──────────────────────────────────────
const COUT_MATERIEL: Record<Nuisible, number> = {
  rongeurs: 35,
  insectes: 45,
  multi:    80,
}

const MULTIPLICATEUR_SERENITE = 1.35

// ── Calcul simplifié (€/m²/an × coeff fréquence) ────────────────────────────
const BASE_PAR_M2: Record<string, number> = {
  restaurant:      8,
  hotel:           10,
  entrepot:        1.5,
  agroalimentaire: 2,
  immeuble:        1,
  bureau:          0.8,
}

const COEFF_FREQUENCE: Record<number, number> = {
  4:  1.0,
  6:  1.3,
  12: 1.8,
}

export function calculerPrixSimple(
  secteur: string,
  superficie: number,
  frequence: number,
  curatives: boolean,
): number {
  const base = BASE_PAR_M2[secteur] ?? 5
  const prix = base * superficie * (COEFF_FREQUENCE[frequence] ?? 1) * (curatives ? 1.25 : 1)
  return Math.max(600, Math.ceil(prix / 50) * 50)
}

// ── Calcul du prix (modèle coût complet) ─────────────────────────────────────
export function calculerPrix(params: PricingParams): {
  prixAnnuel: number
  prixParPassage: number
  coutAEAnnuel: number
  margeNoxyera: number
  formuleSelectionnee: Formule
  detailPassage: { mo: number; deplacement: number; materiel: number }
} {
  const {
    secteur,
    superficie,
    frequence,
    nuisible,
    formule,
    distanceKm = DISTANCE_DEFAULT,
  } = params

  const duree = getDureePassage(superficie)
  const mo = TAUX_HORAIRE_TECHNICIEN * duree * (1 + CHARGES_SOCIALES)
  const deplacement = distanceKm * COUT_KM
  const materiel = COUT_MATERIEL[nuisible]
  const coutParPassage = mo + deplacement + materiel

  const coutAEAnnuel = coutParPassage * frequence
  let prix = (coutAEAnnuel / (1 - MARGE_NOXYERA)) * MULTIPLICATEUR_SECTEUR[secteur]
  if (formule === 'serenite') prix *= MULTIPLICATEUR_SERENITE

  // Arrondi au palier selon l'ordre de grandeur
  const palier = prix < 2000 ? 50 : prix < 10000 ? 100 : prix < 50000 ? 500 : 1000
  const prixAnnuel = Math.ceil(prix / palier) * palier

  return {
    prixAnnuel,
    prixParPassage: Math.round(prixAnnuel / frequence),
    coutAEAnnuel: Math.round(coutAEAnnuel),
    margeNoxyera: Math.round(prixAnnuel - coutAEAnnuel),
    formuleSelectionnee: formule,
    detailPassage: {
      mo: Math.round(mo),
      deplacement: Math.round(deplacement),
      materiel,
    },
  }
}

// ── Benchmarks marché (prix concurrents, réalité terrain) ───────────────────
export const BENCHMARK_MARCHE: Record<Secteur, { bas: number; haut: number }> = {
  restaurant:      { bas: 800,    haut: 3500   },
  hotel:           { bas: 1500,   haut: 12000  },
  entrepot:        { bas: 2000,   haut: 40000  },
  agroalimentaire: { bas: 5000,   haut: 80000  },
  immeuble:        { bas: 600,    haut: 8000   },
  bureau:          { bas: 500,    haut: 3000   },
}

export function positionVsMarche(
  prix: number,
  secteur: Secteur
): 'competitif' | 'dans_fourchette' | 'premium' {
  const { bas, haut } = BENCHMARK_MARCHE[secteur]
  if (prix < bas) return 'competitif'
  if (prix <= haut) return 'dans_fourchette'
  return 'premium'
}

export function formuleSuggeree(curatives: boolean, frequence: Frequence): Formule {
  return curatives || frequence !== 4 ? 'serenite' : 'essentiel'
}

// ── Config superficie par secteur ───────────────────────────────────────────
export interface SuperficieConfig {
  min: number
  max: number
  step: number
  defaultValue: number
  unite: string        // "m²", "m² de surface totale", etc.
  exemples: string     // ex: "Petit restaurant : 80m² · Grande brasserie : 400m²"
}

export const SUPERFICIE_CONFIG: Record<Secteur, SuperficieConfig> = {
  restaurant: {
    min: 50, max: 500, step: 10, defaultValue: 100,
    unite: "m²",
    exemples: "Snack : 50m² · Brasserie : 150m² · Grand restaurant : 400m²",
  },
  hotel: {
    min: 50, max: 500, step: 10, defaultValue: 200,
    unite: "m²",
    exemples: "Petit hôtel 10 ch. : 120m² · Hôtel 3★ : 250m² · Boutique hôtel : 400m²",
  },
  entrepot: {
    min: 200, max: 5000, step: 100, defaultValue: 500,
    unite: "m²",
    exemples: "Local stockage : 200m² · Entrepôt PME : 800m² · Site logistique : 3 000m²",
  },
  agroalimentaire: {
    min: 200, max: 5000, step: 100, defaultValue: 500,
    unite: "m²",
    exemples: "Atelier artisanal : 250m² · Laboratoire : 500m² · Usine PME : 2 000m²",
  },
  immeuble: {
    min: 50, max: 500, step: 10, defaultValue: 150,
    unite: "m² parties communes",
    exemples: "Résidence 10 lots : 80m² · Immeuble 30 lots : 250m² · Grand ensemble : 450m²",
  },
  bureau: {
    min: 50, max: 500, step: 10, defaultValue: 100,
    unite: "m²",
    exemples: "TPE 5 pers. : 60m² · PME 20 pers. : 200m² · Open space 50 pers. : 400m²",
  },
}

export const secteurs: Array<{ id: Secteur; label: string }> = [
  { id: 'restaurant',      label: 'Restaurant/Brasserie' },
  { id: 'hotel',           label: 'Hôtel/Hébergement' },
  { id: 'entrepot',        label: 'Entrepôt/Logistique' },
  { id: 'agroalimentaire', label: 'Industrie agroalimentaire' },
  { id: 'immeuble',        label: 'Immeuble/Bailleur' },
  { id: 'bureau',          label: 'Bureau/Tertiaire' },
]

export const frequences: Array<{ value: Frequence; label: string; cadence: string }> = [
  { value: 4,  label: '4 passages/an',  cadence: 'Trimestriel' },
  { value: 6,  label: '6 passages/an',  cadence: 'Bimestriel' },
  { value: 12, label: '12 passages/an', cadence: 'Mensuel' },
]
