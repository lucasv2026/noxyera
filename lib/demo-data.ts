import type { Profile as SbProfile, Site as SbSite, RapportWithRelations as SbRapport } from "@/lib/types/dashboard";

export type Secteur = "restaurant" | "hotel" | "entrepot" | "agroalimentaire" | "immeuble" | "bureau";
export type Statut = "conforme" | "a_planifier" | "urgent";
export type Formule = "essentiel" | "serenite";
export type TypeIntervention = "preventif" | "curatif" | "urgence";
export type StatutIntervention = "planifie" | "en_cours" | "realise" | "annule";

export interface Site {
  id: string;
  clientId: string;
  nom: string;
  adresse: string;
  ville: string;
  secteur: string;
  superficie: number;
  statut: Statut;
  haccpScore: number;
  formule: Formule;
  prixAnnuel: number;
  prochainPassage: string | null;
}

export interface Client {
  id: string;
  nom: string;
  secteur: string;
  multiSites: boolean;
  nbSites: number;
  statut: Statut;
  haccpScore: number;
  formule: Formule;
  prixAnnuel: number;
}

export interface Intervention {
  id: string;
  clientId: string;
  siteId: string;
  siteNom: string;
  technicienNom: string;
  type: TypeIntervention;
  datePrevue: string;
  dateReelle: string | null;
  statut: StatutIntervention;
  notes: string;
  haccpConforme: boolean;
}

export interface Rapport {
  id: string;
  interventionId: string;
  clientId: string;
  siteNom: string;
  technicienNom: string;
  date: string;
  type: TypeIntervention;
  haccpConforme: boolean;
  pdfUrl: string;
}

export interface Facture {
  id: string;
  clientId: string;
  reference: string;
  date: string;
  montant: number;
  statut: "payee" | "en_attente" | "en_retard";
  description: string;
}

// ─── 5 clients démo ───────────────────────────────────────────────────────────

export const DEMO_CLIENTS: Client[] = [
  {
    id: "c1",
    nom: "Hilton Paris Opéra",
    secteur: "Hôtellerie",
    multiSites: true,
    nbSites: 3,
    statut: "conforme",
    haccpScore: 97,
    formule: "serenite",
    prixAnnuel: 18400,
  },
  {
    id: "c2",
    nom: "Amazon Logistics — Massy",
    secteur: "Entrepôt",
    multiSites: false,
    nbSites: 1,
    statut: "conforme",
    haccpScore: 91,
    formule: "serenite",
    prixAnnuel: 45800,
  },
  {
    id: "c3",
    nom: "Groupe Bonduelle — Villeneuve d'Ascq",
    secteur: "Industrie agroalimentaire",
    multiSites: true,
    nbSites: 2,
    statut: "a_planifier",
    haccpScore: 84,
    formule: "serenite",
    prixAnnuel: 44200,
  },
  {
    id: "c4",
    nom: "Hôtel Le Marais — Paris 3e",
    secteur: "Hôtellerie",
    multiSites: false,
    nbSites: 1,
    statut: "conforme",
    haccpScore: 99,
    formule: "essentiel",
    prixAnnuel: 1400,
  },
  {
    id: "c5",
    nom: "Brasserie Voltaire — Paris 11e",
    secteur: "Restauration",
    multiSites: false,
    nbSites: 1,
    statut: "a_planifier",
    haccpScore: 78,
    formule: "essentiel",
    prixAnnuel: 900,
  },
];

// ─── Sites ────────────────────────────────────────────────────────────────────

export const DEMO_SITES: Site[] = [
  {
    id: "s1", clientId: "c1",
    nom: "Hilton Paris Opéra", adresse: "108 Bd Haussmann", ville: "Paris 8e",
    secteur: "Hôtellerie", superficie: 8400, statut: "conforme", haccpScore: 97,
    formule: "serenite", prixAnnuel: 8200, prochainPassage: "2026-06-15",
  },
  {
    id: "s2", clientId: "c1",
    nom: "Hilton Nice Côte d'Azur", adresse: "37 Promenade des Anglais", ville: "Nice",
    secteur: "Hôtellerie", superficie: 6500, statut: "conforme", haccpScore: 99,
    formule: "serenite", prixAnnuel: 6400, prochainPassage: "2026-06-20",
  },
  {
    id: "s3", clientId: "c1",
    nom: "Hampton by Hilton Bordeaux", adresse: "20 Rue du Château d'Eau", ville: "Bordeaux",
    secteur: "Hôtellerie", superficie: 4200, statut: "a_planifier", haccpScore: 88,
    formule: "serenite", prixAnnuel: 3800, prochainPassage: "2026-05-28",
  },
  {
    id: "s4", clientId: "c2",
    nom: "Entrepôt Amazon Massy BVA1", adresse: "ZAC des Terres Blanches", ville: "Massy",
    secteur: "Logistique", superficie: 62000, statut: "conforme", haccpScore: 91,
    formule: "serenite", prixAnnuel: 45800, prochainPassage: "2026-06-05",
  },
  {
    id: "s5", clientId: "c3",
    nom: "Usine Bonduelle Estrées-Mons", adresse: "Z.I. de la Vallée", ville: "Estrées-Mons",
    secteur: "Agroalimentaire", superficie: 32000, statut: "conforme", haccpScore: 96,
    formule: "serenite", prixAnnuel: 24200, prochainPassage: "2026-06-10",
  },
  {
    id: "s6", clientId: "c3",
    nom: "Usine Bonduelle Renescure", adresse: "Hameau de la Gare", ville: "Renescure (Nord)",
    secteur: "Agroalimentaire", superficie: 28000, statut: "a_planifier", haccpScore: 84,
    formule: "serenite", prixAnnuel: 20000, prochainPassage: "2026-05-25",
  },
  {
    id: "s7", clientId: "c4",
    nom: "Hôtel Le Marais", adresse: "15 Rue des Archives", ville: "Paris 3e",
    secteur: "Hôtellerie", superficie: 820, statut: "conforme", haccpScore: 99,
    formule: "essentiel", prixAnnuel: 1400, prochainPassage: "2026-07-01",
  },
  {
    id: "s8", clientId: "c5",
    nom: "Brasserie Voltaire", adresse: "1 Place Léon Blum", ville: "Paris 11e",
    secteur: "Restauration", superficie: 320, statut: "a_planifier", haccpScore: 78,
    formule: "essentiel", prixAnnuel: 900, prochainPassage: "2026-05-22",
  },
];

// ─── Interventions ────────────────────────────────────────────────────────────

export const DEMO_INTERVENTIONS: Intervention[] = [
  {
    id: "i1", clientId: "c1", siteId: "s1",
    siteNom: "Hilton Paris Opéra", technicienNom: "Thomas Lebrun",
    type: "preventif", datePrevue: "2026-05-10", dateReelle: "2026-05-10",
    statut: "realise", notes: "Passage trimestriel — RAS. Renouvellement pièges zone cuisine.", haccpConforme: true,
  },
  {
    id: "i2", clientId: "c2", siteId: "s4",
    siteNom: "Entrepôt Amazon Massy BVA1", technicienNom: "Sophie Martin",
    type: "preventif", datePrevue: "2026-05-08", dateReelle: "2026-05-08",
    statut: "realise", notes: "Inspection mensuelle. Traces de rongeurs zone dock B — traitement renforcé.", haccpConforme: true,
  },
  {
    id: "i3", clientId: "c3", siteId: "s6",
    siteNom: "Usine Bonduelle Renescure", technicienNom: "Marc Durand",
    type: "curatif", datePrevue: "2026-05-22", dateReelle: null,
    statut: "planifie", notes: "Signalement cafards zone conditionnement.", haccpConforme: true,
  },
  {
    id: "i4", clientId: "c5", siteId: "s8",
    siteNom: "Brasserie Voltaire", technicienNom: "Thomas Lebrun",
    type: "preventif", datePrevue: "2026-05-22", dateReelle: null,
    statut: "planifie", notes: "Passage trimestriel planifié.", haccpConforme: true,
  },
  {
    id: "i5", clientId: "c1", siteId: "s3",
    siteNom: "Hampton by Hilton Bordeaux", technicienNom: "Sophie Martin",
    type: "preventif", datePrevue: "2026-05-28", dateReelle: null,
    statut: "planifie", notes: "Passage trimestriel.", haccpConforme: true,
  },
  {
    id: "i6", clientId: "c1", siteId: "s1",
    siteNom: "Hilton Paris Opéra", technicienNom: "Thomas Lebrun",
    type: "preventif", datePrevue: "2026-02-10", dateReelle: "2026-02-10",
    statut: "realise", notes: "Passage trimestriel — renouvellement biocides zone piscine.", haccpConforme: true,
  },
  {
    id: "i7", clientId: "c2", siteId: "s4",
    siteNom: "Entrepôt Amazon Massy BVA1", technicienNom: "Sophie Martin",
    type: "urgence", datePrevue: "2026-04-15", dateReelle: "2026-04-15",
    statut: "realise", notes: "Intervention urgente — nid de frelons quai de déchargement.", haccpConforme: true,
  },
];

// ─── Rapports ─────────────────────────────────────────────────────────────────

export const DEMO_RAPPORTS: Rapport[] = [
  {
    id: "r1", interventionId: "i1", clientId: "c1",
    siteNom: "Hilton Paris Opéra", technicienNom: "Thomas Lebrun",
    date: "2026-05-10", type: "preventif", haccpConforme: true,
    pdfUrl: "#",
  },
  {
    id: "r2", interventionId: "i2", clientId: "c2",
    siteNom: "Entrepôt Amazon Massy BVA1", technicienNom: "Sophie Martin",
    date: "2026-05-08", type: "preventif", haccpConforme: true,
    pdfUrl: "#",
  },
  {
    id: "r3", interventionId: "i6", clientId: "c1",
    siteNom: "Hilton Paris Opéra", technicienNom: "Thomas Lebrun",
    date: "2026-02-10", type: "preventif", haccpConforme: true,
    pdfUrl: "#",
  },
  {
    id: "r4", interventionId: "i7", clientId: "c2",
    siteNom: "Entrepôt Amazon Massy BVA1", technicienNom: "Sophie Martin",
    date: "2026-04-15", type: "urgence", haccpConforme: true,
    pdfUrl: "#",
  },
];

// ─── Factures ─────────────────────────────────────────────────────────────────

export const DEMO_FACTURES: Facture[] = [
  {
    id: "f1", clientId: "c1",
    reference: "FAC-2026-0042", date: "2026-01-15",
    montant: 18400, statut: "payee",
    description: "Contrat annuel Sérénité — Hilton Paris Opéra (3 sites)",
  },
  {
    id: "f2", clientId: "c2",
    reference: "FAC-2026-0031", date: "2026-01-10",
    montant: 45800, statut: "payee",
    description: "Contrat annuel Sérénité — Amazon Logistics Massy",
  },
  {
    id: "f3", clientId: "c3",
    reference: "FAC-2026-0028", date: "2026-02-01",
    montant: 44200, statut: "en_attente",
    description: "Contrat annuel Sérénité — Groupe Bonduelle (2 sites)",
  },
  {
    id: "f4", clientId: "c4",
    reference: "FAC-2026-0019", date: "2026-01-05",
    montant: 1400, statut: "payee",
    description: "Contrat annuel Essentiel — Hôtel Le Marais",
  },
  {
    id: "f5", clientId: "c5",
    reference: "FAC-2026-0012", date: "2026-01-05",
    montant: 900, statut: "en_retard",
    description: "Contrat annuel Essentiel — Brasserie Voltaire",
  },
];

// ─── Yooma Urban Lodge — client démo connecté ────────────────────────────────
// Ces données s'affichent dans le dashboard client dès la connexion en mode démo.

export const DEMO_YOOMA_CLIENT: Client = {
  id: "yooma",
  nom: "Yooma Urban Lodge Paris 15e",
  secteur: "Hôtellerie",
  multiSites: true,
  nbSites: 2,
  statut: "conforme",
  haccpScore: 94,
  formule: "serenite",
  prixAnnuel: 4800,
};

export const DEMO_YOOMA_SITES: Site[] = [
  {
    id: "ys1",
    clientId: "yooma",
    nom: "Yooma Urban Lodge — Restaurant Le Jardin",
    adresse: "22 Rue Linois",
    ville: "Paris 15e",
    secteur: "Restauration hôtelière",
    superficie: 380,
    statut: "conforme",
    haccpScore: 96,
    formule: "serenite",
    prixAnnuel: 2600,
    prochainPassage: "2026-07-15",
  },
  {
    id: "ys2",
    clientId: "yooma",
    nom: "Yooma Urban Lodge — Bar & Lobby",
    adresse: "22 Rue Linois",
    ville: "Paris 15e",
    secteur: "Hôtellerie",
    superficie: 210,
    statut: "a_planifier",
    haccpScore: 88,
    formule: "serenite",
    prixAnnuel: 2200,
    prochainPassage: "2026-05-28",
  },
];

export const DEMO_YOOMA_INTERVENTIONS: Intervention[] = [
  {
    id: "yi1",
    clientId: "yooma",
    siteId: "ys1",
    siteNom: "Yooma — Restaurant Le Jardin",
    technicienNom: "Jean-Marc Deschamps",
    type: "preventif",
    datePrevue: "2026-03-12",
    dateReelle: "2026-03-12",
    statut: "realise",
    notes: "Passage trimestriel — RAS. Renouvellement appâts zone cuisine et réserves.",
    haccpConforme: true,
  },
  {
    id: "yi2",
    clientId: "yooma",
    siteId: "ys2",
    siteNom: "Yooma — Bar & Lobby",
    technicienNom: "Jean-Marc Deschamps",
    type: "preventif",
    datePrevue: "2026-04-22",
    dateReelle: "2026-04-22",
    statut: "realise",
    notes: "Passage semestriel. Traitement préventif moustiques terrasse. Conforme DDPP.",
    haccpConforme: true,
  },
  {
    id: "yi3",
    clientId: "yooma",
    siteId: "ys2",
    siteNom: "Yooma — Bar & Lobby",
    technicienNom: "Jean-Marc Deschamps",
    type: "preventif",
    datePrevue: "2026-05-28",
    dateReelle: null,
    statut: "planifie",
    notes: "Passage trimestriel planifié. Vérification pièges et renouvellement biocides.",
    haccpConforme: true,
  },
];

export const DEMO_YOOMA_RAPPORTS: Rapport[] = [
  {
    id: "yr1",
    interventionId: "yi1",
    clientId: "yooma",
    siteNom: "Yooma — Restaurant Le Jardin",
    technicienNom: "Jean-Marc Deschamps",
    date: "2026-03-12",
    type: "preventif",
    haccpConforme: true,
    pdfUrl: "#",
  },
  {
    id: "yr2",
    interventionId: "yi2",
    clientId: "yooma",
    siteNom: "Yooma — Bar & Lobby",
    technicienNom: "Jean-Marc Deschamps",
    date: "2026-04-22",
    type: "preventif",
    haccpConforme: true,
    pdfUrl: "#",
  },
];

// ─── Techniciens (pour espace technicien) ─────────────────────────────────────

export const DEMO_TECHNICIENS = [
  {
    id: "jmd",
    nom: "Jean-Marc Deschamps",
    certif: "Certibiocide n°14521",
    missions: [
      {
        id: "yi3",
        siteNom: "Yooma Urban Lodge — Bar & Lobby",
        adresse: "22 Rue Linois, Paris 15e",
        type: "preventif" as TypeIntervention,
        heure: "09:00 – 11:30",
        statut: "planifie" as const,
      },
    ],
  },
  {
    id: "t1",
    nom: "Thomas Lebrun",
    certif: "Certibiocide n°12847",
    missions: [
      {
        id: "m1", siteNom: "Hilton Paris Opéra",
        adresse: "108 Bd Haussmann, Paris 8e",
        type: "preventif" as TypeIntervention,
        heure: "08:00 – 11:00", statut: "realise" as const,
      },
      {
        id: "m2", siteNom: "Hampton by Hilton Bordeaux",
        adresse: "20 Rue du Château d'Eau, Bordeaux",
        type: "preventif" as TypeIntervention,
        heure: "14:00 – 16:30", statut: "planifie" as const,
      },
      {
        id: "m3", siteNom: "Brasserie Voltaire",
        adresse: "1 Place Léon Blum, Paris 11e",
        type: "preventif" as TypeIntervention,
        heure: "17:30 – 19:00", statut: "planifie" as const,
      },
    ],
  },
];

// ─── Admin data ───────────────────────────────────────────────────────────────

export const ADMIN_METRICS = {
  gmv: 284600,
  activeContracts: 47,
  techniciansToday: 23,
  slaCompliance: 98.4,
  monthlyRevenue: [
    { month: "Jan", revenue: 38200, commission: 5730 },
    { month: "Fév", revenue: 41500, commission: 6225 },
    { month: "Mar", revenue: 45800, commission: 6870 },
    { month: "Avr", revenue: 49200, commission: 7380 },
    { month: "Mai", revenue: 52400, commission: 7860 },
    { month: "Juin", revenue: 48900, commission: 7335 },
    { month: "Juil", revenue: 51300, commission: 7695 },
    { month: "Août", revenue: 44700, commission: 6705 },
    { month: "Sep", revenue: 58100, commission: 8715 },
    { month: "Oct", revenue: 61200, commission: 9180 },
    { month: "Nov", revenue: 63800, commission: 9570 },
    { month: "Déc", revenue: 67400, commission: 10110 },
  ],
};

export const ADMIN_ALERTS = [
  { id: "a1", type: "sla" as const, text: "Groupe Bonduelle Renescure — SLA à risque (J+2)", level: "danger" as const },
  { id: "a2", type: "late" as const, text: "Marc Durand — Pointage retardé (30 min) site Bonduelle", level: "warning" as const },
  { id: "a3", type: "complaint" as const, text: "Brasserie Voltaire — Demande d'intervention urgente reçue", level: "warning" as const },
  { id: "a4", type: "late" as const, text: "Thomas Lebrun — Arrivée retardée Bordeaux", level: "info" as const },
];

export const ADMIN_TOP_CLIENTS = [
  { name: "Amazon Logistics — Massy", arr: 45800, churn: "low" as const, trend: "+12%" },
  { name: "Groupe Bonduelle — Villeneuve d'Ascq", arr: 44200, churn: "medium" as const, trend: "-5%" },
  { name: "Hilton Paris Opéra (3 sites)", arr: 18400, churn: "low" as const, trend: "+8%" },
  { name: "Hôtel Le Marais — Paris 3e", arr: 1400, churn: "low" as const, trend: "+2%" },
  { name: "Brasserie Voltaire — Paris 11e", arr: 900, churn: "high" as const, trend: "+15%" },
];

export const ADMIN_TECH_DOTS = [
  { id: "t1", x: 147, y: 79, status: "on-site" as const, name: "T. Lebrun" },
  { id: "t2", x: 89, y: 224, status: "between" as const, name: "S. Martin" },
  { id: "t3", x: 253, y: 88, status: "on-site" as const, name: "M. Dubois" },
  { id: "t4", x: 197, y: 193, status: "on-site" as const, name: "A. Bernard" },
  { id: "t5", x: 161, y: 14, status: "between" as const, name: "L. Simon" },
  { id: "t6", x: 245, y: 258, status: "on-site" as const, name: "N. Petit" },
];

export const ADMIN_TECHNICIENS = [
  {
    id: "t1", nom: "Thomas Lebrun", certif: "Certibiocide n°12847",
    region: "Île-de-France", statut: "actif" as const,
    missionsAujourdhui: 3, missionsTotal: 148, note: 4.9,
    email: "t.lebrun@noxyera.com",
  },
  {
    id: "t2", nom: "Sophie Martin", certif: "Certibiocide n°11294",
    region: "Île-de-France / Nord", statut: "actif" as const,
    missionsAujourdhui: 2, missionsTotal: 134, note: 4.8,
    email: "s.martin@noxyera.com",
  },
  {
    id: "t3", nom: "Marc Durand", certif: "Certibiocide n°13102",
    region: "Nord / Hauts-de-France", statut: "actif" as const,
    missionsAujourdhui: 1, missionsTotal: 97, note: 4.6,
    email: "m.durand@noxyera.com",
  },
  {
    id: "t4", nom: "Camille Bernard", certif: "Certibiocide n°10887",
    region: "Rhône-Alpes", statut: "inactif" as const,
    missionsAujourdhui: 0, missionsTotal: 212, note: 4.9,
    email: "c.bernard@noxyera.com",
  },
];

// ADMIN_LEADS: prospects capturés via le tunnel estimateur
// Champs: id, email, nom_etablissement, secteur, superficie, frequence,
//         curatives, prixEstime, formuleSuggeree, score_risque, statut, createdAt
export const ADMIN_LEADS = [
  {
    id: "l1", email: "contact@restaurant-dupont.fr",
    nom_etablissement: "Restaurant Dupont",
    secteur: "restaurant", superficie: 120, frequence: 4, curatives: false,
    prixEstime: 1100, formuleSuggeree: "essentiel",
    score_risque: 6.2,
    statut: "a_rappeler" as const,
    createdAt: "2026-05-18T10:23:00Z",
  },
  {
    id: "l2", email: "direction@hotel-bellevue.com",
    nom_etablissement: "Hôtel Bellevue",
    secteur: "hotel", superficie: 340, frequence: 12, curatives: true,
    prixEstime: 8200, formuleSuggeree: "serenite",
    score_risque: 8.1,
    statut: "propose" as const,
    createdAt: "2026-05-17T15:41:00Z",
  },
  {
    id: "l3", email: "hygiene@entrepot-logifrance.fr",
    nom_etablissement: "Entrepôt Logifrance",
    secteur: "entrepot", superficie: 8500, frequence: 6, curatives: true,
    prixEstime: 6800, formuleSuggeree: "serenite",
    score_risque: 7.5,
    statut: "propose" as const,
    createdAt: "2026-05-16T09:15:00Z",
  },
  {
    id: "l4", email: "qualite@agrostar.fr",
    nom_etablissement: "Agrostar Industries",
    secteur: "agroalimentaire", superficie: 4200, frequence: 12, curatives: true,
    prixEstime: 18700, formuleSuggeree: "serenite",
    score_risque: 9.0,
    statut: "signe" as const,
    createdAt: "2026-05-15T14:08:00Z",
  },
  {
    id: "l5", email: "gerant@brasserie-lepont.com",
    nom_etablissement: "Brasserie Le Pont",
    secteur: "restaurant", superficie: 200, frequence: 4, curatives: false,
    prixEstime: 1800, formuleSuggeree: "essentiel",
    score_risque: 4.8,
    statut: "a_rappeler" as const,
    createdAt: "2026-05-14T11:52:00Z",
  },
];

// ─── Données demo shapées pour Supabase (dashboard client réel) ───────────────
// Ces exports ont exactement la même forme que les réponses Supabase pour
// pouvoir être utilisés comme fallback quand NEXT_PUBLIC_DEMO_MODE=true.

// (Supabase-shaped types imported at top of file as SbProfile, SbSite, SbRapport)

const NOW = new Date()
const IN_12_DAYS = new Date(NOW.getTime() + 12 * 24 * 3600 * 1000).toISOString()
const MINUS_45 = new Date(NOW.getTime() - 45 * 24 * 3600 * 1000).toISOString()
const MINUS_10 = new Date(NOW.getTime() - 10 * 24 * 3600 * 1000).toISOString()

export const SUPABASE_DEMO_PROFILE: SbProfile = {
  id: "demo-profile-id",
  user_id: "demo-user-id",
  role: "client",
  nom: "Van Dard",
  prenom: "Lucas",
  email: "lucas@agencenikita.com",
  telephone: "+33 6 12 34 56 78",
  entreprise: "Yooma Urban Lodge",
}

export const SUPABASE_DEMO_SITES: SbSite[] = [
  {
    id: "ys1",
    client_id: "demo-profile-id",
    nom: "Yooma Urban Lodge Paris 15e",
    adresse: "173 Quai André Citroën",
    ville: "Paris",
    code_postal: "75015",
    secteur: "hotel",
    superficie: 106,
    statut: "actif",
    contracts: [
      {
        id: "c1",
        site_id: "ys1",
        formule: "serenite",
        frequence: 6,
        curatives_incluses: true,
        prix_annuel: 2000,
        date_debut: "2026-01-01",
        date_fin: "2027-01-01",
        statut: "actif",
      },
    ],
    interventions: [
      {
        id: "i1",
        site_id: "ys1",
        technicien_id: "t-jmd",
        contract_id: "c1",
        type: "preventif",
        date_prevue: IN_12_DAYS,
        date_reelle: null,
        statut: "planifie",
        notes: "Passage trimestriel préventif",
      },
      {
        id: "i2",
        site_id: "ys1",
        technicien_id: "t-jmd",
        contract_id: "c1",
        type: "preventif",
        date_prevue: MINUS_45,
        date_reelle: MINUS_45,
        statut: "realise",
        notes: "Inspection complète — RAS",
      },
    ],
  },
  {
    id: "ys2",
    client_id: "demo-profile-id",
    nom: "Brasserie Voltaire — démo",
    adresse: "12 Rue de la Roquette",
    ville: "Paris",
    code_postal: "75011",
    secteur: "restaurant",
    superficie: 150,
    statut: "actif",
    contracts: [
      {
        id: "c2",
        site_id: "ys2",
        formule: "essentiel",
        frequence: 4,
        curatives_incluses: false,
        prix_annuel: 1200,
        date_debut: "2026-03-01",
        date_fin: "2027-03-01",
        statut: "actif",
      },
    ],
    interventions: [],
  },
]

export const SUPABASE_DEMO_RAPPORTS: SbRapport[] = [
  {
    id: "yr1",
    intervention_id: "i2",
    technicien_id: "t-jmd",
    pdf_url: null,
    haccp_conforme: true,
    signe_le: MINUS_45,
    created_at: MINUS_45,
    interventions: {
      id: "i2",
      type: "preventif",
      date_reelle: MINUS_45,
      date_prevue: MINUS_45,
      notes: "Inspection complète — RAS",
      sites: { nom: "Yooma Urban Lodge Paris 15e", adresse: "173 Quai André Citroën" },
      profiles: { nom: "Deschamps", prenom: "Jean-Marc" },
    },
  },
  {
    id: "yr2",
    intervention_id: "i3",
    technicien_id: "t-jmd",
    pdf_url: null,
    haccp_conforme: true,
    signe_le: MINUS_10,
    created_at: MINUS_10,
    interventions: {
      id: "i3",
      type: "preventif",
      date_reelle: MINUS_10,
      date_prevue: MINUS_10,
      notes: "Passage semestriel. Traitement préventif moustiques terrasse.",
      sites: { nom: "Yooma Urban Lodge Paris 15e", adresse: "173 Quai André Citroën" },
      profiles: { nom: "Deschamps", prenom: "Jean-Marc" },
    },
  },
]
