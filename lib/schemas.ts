import { z } from 'zod'

export const LeadSchema = z.object({
  email: z.string().email(),
  secteur: z.enum(['restaurant','hotel','entrepot','agroalimentaire','immeuble','bureau']),
  superficie: z.number().min(10).max(10000),
  frequence: z.number().refine(v => [4,6,12].includes(v)),
  curatives: z.boolean(),
  nom_etablissement: z.string().max(200).optional(),
  score_global: z.number().min(0).max(10).optional(),
  formule_suggeree: z.enum(['essentiel','serenite']).optional(),
})

export const AuditSchema = z.object({
  nom: z.string().min(2).max(100),
  email: z.string().email(),
  telephone: z.string().min(8).max(20),
  nom_etablissement: z.string().min(2).max(200).optional(),
  adresse: z.string().min(5).max(300).optional(),
  secteur: z.enum(['restaurant','hotel','entrepot','agroalimentaire','immeuble','bureau']).optional(),
  superficie: z.number().min(10).max(50000).optional(),
  nb_employes: z.number().min(1).max(10000).optional(),
  prestataire_actuel: z.boolean().optional(),
  problemes_recents: z.enum(['oui','non','ne_sais_pas']).optional(),
  rapports_a_jour: z.enum(['oui','non','partiellement']).optional(),
  disponibilites: z.string().optional(),
  photos_url: z.array(z.string()).optional(),
  situation_actuelle: z.record(z.string(), z.unknown()).optional(),
})

export const PestScoreSchema = z.object({
  adresse: z.string().min(5),
  secteur: z.enum(['restaurant','hotel','entrepot','agroalimentaire','immeuble','bureau']),
  lat: z.number().optional(),
  lng: z.number().optional(),
})
