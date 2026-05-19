// Matrice de pondération validée depuis Noxyera_PestScore_Matrix.xlsx
// MAX_RONGEURS=44  MAX_BLATTES=40  MAX_PUNAISES=21
// Pondération globale : 50% rongeurs + 30% blattes + 20% punaises

export interface PestScoreInput {
  // ── A. MÉTÉO (OpenWeatherMap) ─────────────────────────────────────────────
  precipitations7j: number         // mm cumulés 7j
  temperatureMoyenne: number       // °C actuelle
  humidite: number                 // % humidité relative
  changementBrutalTemp?: boolean   // écart >10°C sur 48h

  // ── B. TRAVAUX (open.paris.fr) ────────────────────────────────────────────
  chantierVoirie200m: boolean
  demolitionBatiment100m: boolean
  chantierMetro300m: boolean
  fermetureVoisinResto50m?: boolean   // fermeture temporaire voisin <50m
  marcheAlimentaire200m?: boolean     // marché alim de plein air <200m

  // ── C. ALIM'CONFIANCE (dgal.opendatasoft.com) ────────────────────────────
  niveauHygieneEtablissement: 'tres_satisfaisant' | 'satisfaisant' | 'a_ameliorer' | 'non_satisfaisant'
  fermetureVoisinInfraction6mois: boolean
  nbEtablissementsRisqueVoisins: number   // "à améliorer" rayon 300m
  controleDDPP12mois: boolean
  sansControle24mois?: boolean            // aucun contrôle depuis >24 mois

  // ── D. GÉOGRAPHIE (OpenStreetMap Overpass) ───────────────────────────────
  proximitEgout50m: boolean
  densiteRestaurants200m: number
  ancienneteBatiment: number       // années
  proximiteCanal300m: boolean      // Seine / canal
  arrondissementParis: number      // 1-20
  videOrdures?: boolean            // vide-ordures collectif dans l'immeuble

  // ── E. TOURISME & ÉVÉNEMENTS ─────────────────────────────────────────────
  tauxOccupationHotel?: boolean    // >80%
  evenementMajeur2km: boolean
  saisonHaute: boolean             // Juin–Août
  proximitéGare500m: boolean
}

export interface PestScoreResult {
  rongeurs: number    // /10
  blattes: number     // /10
  punaises: number    // /10
  global: number      // /10 (50% R + 30% B + 20% P)
  niveau: 'critique' | 'eleve' | 'modere' | 'faible'
  message: string
  facteursPrincipaux: string[]
}

// Arrondissements Paris structurellement les plus infestés (matrice Excel)
const ARRONDISSEMENTS_ENDEMIQUES = [1,2,3,4,5,6,7,8,9,10,11,18,19,20]

export function calculerPestScore(input: PestScoreInput): PestScoreResult {
  let R = 0  // rongeurs raw
  let B = 0  // blattes raw
  let P = 0  // punaises raw
  const facteurs: Array<{ label: string; impact: number }> = []

  // ── A. MÉTÉO ──────────────────────────────────────────────────────────────
  if (input.precipitations7j > 30) {
    R += 3; B += 1
    facteurs.push({ label: "Fortes pluies récentes — remontée des rongeurs d'égouts", impact: 3 })
  } else if (input.precipitations7j > 15) {
    R += 1
  }

  if (input.temperatureMoyenne < 5) {
    R += 2
    facteurs.push({ label: "Vague de froid — migration des rongeurs vers les bâtiments chauffés", impact: 2 })
  }

  if (input.temperatureMoyenne > 25) {
    B += 3; P += 1
    facteurs.push({ label: "Canicule — prolifération des blattes accélérée", impact: 2 })
  }

  if (input.humidite > 80) {
    R += 1; B += 2; P += 1
    facteurs.push({ label: "Forte humidité — reproduction des blattes accélérée", impact: 1 })
  }

  if (input.changementBrutalTemp) {
    R += 1; B += 1
  }

  // ── B. TRAVAUX ────────────────────────────────────────────────────────────
  if (input.chantierVoirie200m) {
    R += 3; B += 2
    facteurs.push({ label: "Chantier voirie actif <200m — déplacement massif de colonies", impact: 3 })
  }

  if (input.demolitionBatiment100m) {
    R += 3; B += 2; P += 1
    facteurs.push({ label: "Démolition <100m — fuite immédiate des nuisibles hébergés", impact: 3 })
  }

  if (input.chantierMetro300m) {
    R += 2; B += 1
  }

  if (input.fermetureVoisinResto50m) {
    R += 2; B += 2
    facteurs.push({ label: "Fermeture d'un voisin restauration <50m — migration vers votre site", impact: 2 })
  }

  if (input.marcheAlimentaire200m) {
    R += 2; B += 2
    facteurs.push({ label: "Marché alimentaire <200m — attracteur permanent de rongeurs", impact: 1 })
  }

  // ── C. ALIM'CONFIANCE ────────────────────────────────────────────────────
  if (input.niveauHygieneEtablissement === 'a_ameliorer' || input.niveauHygieneEtablissement === 'non_satisfaisant') {
    R += 3; B += 3; P += 2
    facteurs.push({ label: "Score hygiène 'à améliorer' — infestation non traitée probable", impact: 3 })
  }

  if (input.fermetureVoisinInfraction6mois) {
    R += 3; B += 3; P += 1
    facteurs.push({ label: "Fermeture voisin pour infraction sanitaire <6 mois — migration directe", impact: 3 })
  }

  if (input.nbEtablissementsRisqueVoisins >= 3) {
    R += 2; B += 2; P += 1
    facteurs.push({ label: `${input.nbEtablissementsRisqueVoisins} établissements "à améliorer" dans 300m — zone endémique`, impact: 2 })
  }

  if (input.controleDDPP12mois) {
    R += 2; B += 2; P += 2
    facteurs.push({ label: "Contrôle DDPP <12 mois — risque de second contrôle surprise", impact: 1 })
  }

  if (input.sansControle24mois) {
    R += 1; B += 1; P += 1
  }

  // ── D. GÉOGRAPHIE ────────────────────────────────────────────────────────
  if (input.proximitEgout50m) {
    R += 3; B += 1
    facteurs.push({ label: "Bouche d'égout <50m — accès direct au réseau rongeurs", impact: 3 })
  }

  if (input.densiteRestaurants200m > 15) {
    R += 2; B += 2
    facteurs.push({ label: "Très haute densité restauration 200m — pression alimentaire permanente", impact: 1 })
  } else if (input.densiteRestaurants200m > 8) {
    R += 1; B += 1
  }

  if (input.ancienneteBatiment > 50) {
    R += 1; B += 2; P += 1
    facteurs.push({ label: "Bâtiment >50 ans — multiples voies d'entrée, joints dégradés", impact: 1 })
  }

  if (input.proximiteCanal300m) {
    R += 3
    facteurs.push({ label: "Proximité Seine/canal <300m — habitat naturel des rongeurs", impact: 2 })
  }

  if (ARRONDISSEMENTS_ENDEMIQUES.includes(input.arrondissementParis)) {
    R += 2; B += 1
    facteurs.push({ label: `${input.arrondissementParis}e arrondissement classé zone endémique Paris`, impact: 1 })
  }

  if (input.videOrdures) {
    R += 2; B += 2
  }

  // ── E. TOURISME ───────────────────────────────────────────────────────────
  if (input.tauxOccupationHotel) {
    B += 1; P += 3
    facteurs.push({ label: "Taux d'occupation hôtelier >80% — flux valises = vecteur punaises N°1", impact: 2 })
  }

  if (input.evenementMajeur2km) {
    B += 1; P += 3
    facteurs.push({ label: "Événement majeur <2km — afflux massif, risque punaises systématique", impact: 2 })
  }

  if (input.saisonHaute) {
    B += 2; P += 2
    facteurs.push({ label: "Haute saison touristique — double facteur blattes et punaises", impact: 1 })
  }

  if (input.proximitéGare500m) {
    R += 1; B += 1; P += 2
  }

  // ── NORMALISATION /10 (MAX depuis matrice Excel) ─────────────────────────
  const MAX_R = 44
  const MAX_B = 40
  const MAX_P = 21

  const rongeurs  = Math.min(10, Math.round(R / MAX_R * 100) / 10)
  const blattes   = Math.min(10, Math.round(B / MAX_B * 100) / 10)
  const punaises  = Math.min(10, Math.round(P / MAX_P * 100) / 10)
  const global    = Math.round((rongeurs * 0.5 + blattes * 0.3 + punaises * 0.2) * 10) / 10

  const niveau: PestScoreResult['niveau'] =
    global >= 8 ? 'critique' :
    global >= 6 ? 'eleve' :
    global >= 4 ? 'modere' : 'faible'

  const messages: Record<PestScoreResult['niveau'], string> = {
    critique: `Score ${global}/10 — Risque critique. Intervention recommandée sous 48h.`,
    eleve:    `Score ${global}/10 — Risque élevé. Un audit préventif est fortement conseillé.`,
    modere:   `Score ${global}/10 — Risque modéré. Surveillez l'évolution de votre zone.`,
    faible:   `Score ${global}/10 — Risque faible. Maintenez votre niveau de prévention.`,
  }

  const facteursPrincipaux = facteurs
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map(f => f.label)

  return { rongeurs, blattes, punaises, global, niveau, message: messages[niveau], facteursPrincipaux }
}
