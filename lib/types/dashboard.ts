// Types correspondant exactement au schéma Supabase

export interface Profile {
  id: string
  user_id: string
  role: 'client' | 'technicien' | 'admin'
  nom: string | null
  prenom: string | null
  email: string
  telephone: string | null
  entreprise: string | null
}

export interface Contract {
  id: string
  site_id: string
  formule: 'essentiel' | 'serenite'
  frequence: 4 | 6 | 12
  curatives_incluses: boolean
  prix_annuel: number
  date_debut: string
  date_fin: string
  statut: 'actif' | 'expire' | 'suspendu'
}

export interface Intervention {
  id: string
  site_id: string
  technicien_id: string | null
  contract_id: string | null
  type: 'preventif' | 'curatif' | 'urgence'
  date_prevue: string
  date_reelle: string | null
  statut: 'planifie' | 'realise' | 'annule'
  notes: string | null
}

export interface Site {
  id: string
  client_id: string
  nom: string
  adresse: string
  ville: string
  code_postal: string
  secteur: string
  superficie: number
  statut: 'actif' | 'inactif'
  contracts?: Contract[]
  interventions?: Intervention[]
}

export interface RapportWithRelations {
  id: string
  intervention_id: string
  technicien_id: string | null
  pdf_url: string | null
  haccp_conforme: boolean
  signe_le: string | null
  created_at: string
  interventions: {
    id: string
    type: 'preventif' | 'curatif' | 'urgence'
    date_reelle: string | null
    date_prevue: string
    notes: string | null
    sites: { nom: string; adresse: string } | null
    profiles: { nom: string | null; prenom: string | null } | null
  } | null
}
