export interface BlogArticle {
  slug: string
  titre: string
  description: string
  date: string
  categorie: "HACCP" | "Règlementation" | "Nuisibles" | "Bonnes pratiques"
  tempsLecture: number
  image: string
  contenu: string
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "rapport-haccp-numerique-restaurant",
    titre: "Rapport HACCP numérique : ce que la loi exige en 2026 pour les restaurants",
    description:
      "Depuis l'entrée en vigueur du Règlement (CE) 852/2004, tout établissement alimentaire doit tenir un Plan de Maîtrise Sanitaire à jour. Voici ce que ça implique concrètement pour votre restaurant.",
    date: "2026-05-10",
    categorie: "HACCP",
    tempsLecture: 6,
    image: "/blog/haccp-restaurant.jpg",
    contenu: `
## Pourquoi le rapport HACCP est obligatoire pour votre restaurant

Le Règlement européen (CE) 852/2004 — transposé en droit français — impose à **tout opérateur du secteur alimentaire** de mettre en place et de tenir à jour un **Plan de Maîtrise Sanitaire (PMS)**. Ce plan inclut obligatoirement la lutte contre les nuisibles.

En cas de contrôle DDPP (Direction Départementale de la Protection des Populations), l'inspecteur peut exiger de consulter vos rapports d'intervention anti-nuisibles des **12 derniers mois**. Sans trace documentée, vous êtes en infraction.

## Ce qu'un rapport HACCP complet doit contenir

Un rapport d'intervention anti-nuisibles conforme HACCP doit comporter :

- **Date et heure** de l'intervention
- **Identité du technicien** et son numéro de certification Certibiocide
- **Zones traitées** avec description précise (cuisine, réserves, locaux poubelles…)
- **Produits biocides utilisés** : nom commercial, substance active, numéro d'AMM
- **Doses appliquées** et méthode d'application
- **Observations** : signes d'activité nuisibles constatés, mesures correctives préconisées
- **Signature du technicien et du responsable établissement**

## Le problème avec les rapports papier

La grande majorité des prestataires anti-nuisibles remettent encore leurs rapports sur papier. Ces documents :

- Se perdent facilement
- Ne sont pas horodatés de façon infalsifiable
- Nécessitent un classeur dédié impossible à retrouver en urgence lors d'un contrôle
- Ne permettent pas de tracer l'évolution du risque dans le temps

## La solution numérique : accès immédiat, traçabilité totale

Avec Noxyera, chaque intervention génère automatiquement un **rapport PDF signé** stocké dans votre espace client. En cas de contrôle :

1. Ouvrez votre smartphone
2. Connectez-vous à votre tableau de bord
3. Téléchargez ou affichez le rapport en 10 secondes

Vos rapports sont conservés **5 ans** conformément aux obligations réglementaires.

## Ce que risque un restaurant non conforme

Lors d'un contrôle DDPP défavorable, les sanctions peuvent être :

- **Mise en demeure** de régularisation sous 30 jours
- **Fermeture administrative temporaire** pour les cas graves
- **Publication de la notation Alim'confiance** visible par tous vos clients sur les moteurs de recherche
- **Amende** pouvant atteindre 1 500 € en cas de récidive

La conformité HACCP n'est pas un luxe : c'est une nécessité économique.
    `.trim(),
  },
  {
    slug: "pest-alert-score-risque-nuisibles",
    titre: "Pest Alert Score : comment calculer le risque nuisibles de votre établissement",
    description:
      "Le Pest Alert Score est un indice de risque nuisibles développé par Noxyera à partir de 18 facteurs environnementaux, météorologiques et réglementaires. Découvrez comment il est calculé.",
    date: "2026-05-03",
    categorie: "Nuisibles",
    tempsLecture: 5,
    image: "/blog/pest-alert.jpg",
    contenu: `
## Qu'est-ce que le Pest Alert Score ?

Le Pest Alert Score est un **indicateur de risque nuisibles** développé par Noxyera. Il agrège en temps réel des données provenant de 6 sources ouvertes pour calculer la probabilité d'infestation d'un établissement alimentaire.

Score de **0 à 10** : en dessous de 4, le risque est faible. Entre 4 et 7, une intervention préventive est recommandée. Au-dessus de 7, une intervention urgente s'impose.

## Les 18 facteurs analysés

### Données météorologiques (via OpenWeatherMap)
- Température moyenne des 7 derniers jours
- Taux d'humidité
- Cumul de précipitations

Les rongeurs (rats, souris) prolifèrent par temps chaud et humide. Les blattes privilégient les environnements >20°C avec forte humidité.

### Environnement urbain (via OpenStreetMap)
- Proximité d'égouts à moins de 50m
- Densité de restaurants dans un rayon de 200m
- Présence d'un canal ou cours d'eau à moins de 300m
- Gare ou station de métro à moins de 500m

La proximité des transports en commun est un facteur majeur de propagation des punaises de lit et cafards.

### Chantiers à proximité (Open Data Paris)
- Chantier de voirie à moins de 200m
- Chantier métro/Grand Paris Express à moins de 300m

Les travaux délogent les colonies de rongeurs et les orientent vers les établissements alimentaires.

### Hygiène du voisinage (Alim'confiance)
- Nombre d'établissements en infraction hygiènes dans un rayon de 300m
- Contrôle DDPP de moins de 12 mois

### Saisonnalité
- Mois de juin à août : saison haute (mouches, fourmis, guêpes)

## Comment utiliser le Pest Alert Score pour votre établissement ?

Rendez-vous sur [noxyera.com/suivi-sanitaire](/suivi-sanitaire) et entrez l'adresse de votre établissement. Le score est calculé en moins de 5 secondes, gratuitement.

Si votre score dépasse 6, nos techniciens Certibiocide peuvent intervenir sous **48h** partout en France.
    `.trim(),
  },
  {
    slug: "deratisation-restaurant-frequence-legale",
    titre: "Dératisation restaurant : quelle fréquence est obligatoire en France ?",
    description:
      "La loi ne fixe pas de fréquence minimale pour la dératisation des restaurants, mais le Plan de Maîtrise Sanitaire, lui, l'impose indirectement. Explications.",
    date: "2026-04-22",
    categorie: "Règlementation",
    tempsLecture: 4,
    image: "/blog/deratisation.jpg",
    contenu: `
## Aucune fréquence légale… mais une obligation de résultat

Contrairement à ce qu'on entend souvent, **il n'existe pas de fréquence légale obligatoire** pour la dératisation des restaurants en France. Ce que la loi impose, c'est une **obligation de résultat** : votre établissement doit être exempt de nuisibles.

La DDPP peut vous demander à tout moment de prouver que vous maîtrisez le risque nuisibles. C'est là qu'intervient le Plan de Maîtrise Sanitaire.

## Ce que votre PMS doit prévoir

Votre Plan de Maîtrise Sanitaire doit contenir un **programme de lutte contre les nuisibles** précisant :

1. **La fréquence des inspections** (au minimum 1 fois par an pour les établissements à faible risque)
2. **Les prestataires agréés** et leurs certifications Certibiocide
3. **Les zones à risque** identifiées dans votre établissement
4. **Les mesures préventives** mises en place (colmatage, propreté, gestion des déchets)

## Fréquences recommandées selon le type d'établissement

| Type d'établissement | Fréquence recommandée |
|---|---|
| Restaurant < 50 couverts | 2 passages/an minimum |
| Restaurant > 50 couverts | 4 passages/an |
| Cuisine centrale / traiteur | Mensuel |
| Hôtel (hors restauration) | 2 passages/an |
| Hôtel avec restauration | 4 à 6 passages/an |
| Industrie agroalimentaire | Mensuel à bimensuel |

## Le cas particulier de Paris et de l'Île-de-France

Paris concentre une densité de rongeurs parmi les plus élevées d'Europe. Les arrondissements autour des gares (10e, 18e, 19e, 20e) et des canaux (19e, 10e) présentent des risques particulièrement élevés.

En Île-de-France, il est recommandé d'effectuer au minimum **4 passages par an** pour tout établissement de restauration, quelle que soit sa taille.

## Noxyera : un contrat adapté à votre niveau de risque

Nos formules **Essentiel** (2 passages/an) et **Sérénité** (passages illimités) sont conçues pour répondre aux exigences HACCP de chaque type d'établissement. Chaque intervention génère automatiquement un rapport PDF conforme.
    `.trim(),
  },
  {
    slug: "cafards-restaurant-que-faire",
    titre: "Cafards dans un restaurant : que faire (et comment l'éviter)",
    description:
      "Une infestation de blattes dans un restaurant peut entraîner fermeture administrative et mauvaise notation Alim'confiance. Voici les bons réflexes et mesures préventives.",
    date: "2026-04-15",
    categorie: "Bonnes pratiques",
    tempsLecture: 5,
    image: "/blog/cafards.jpg",
    contenu: `
## Pourquoi les restaurants sont particulièrement exposés aux blattes

Les blattes germaniques (*Blattella germanica*) et les blattes orientales (*Blatta orientalis*) sont les deux espèces les plus fréquentes dans les cuisines professionnelles françaises. Elles prolifèrent pour trois raisons principales :

- **Chaleur** : les zones autour des équipements de cuisson maintiennent une température idéale >25°C
- **Humidité** : lave-vaisselle, éviers, tuyauteries
- **Nourriture accessible** : résidus alimentaires dans les joints, sous les équipements, dans les conduits

## Les signes d'une infestation à surveiller

Une colonie de blattes se détecte avant tout par :

- Des **déjections brunes** (points noirs) sous les équipements, dans les angles
- Des **oothèques** (capsules d'œufs brunes allongées) derrière les plinthes
- Une **odeur musquée** caractéristique en ouvrant les placards
- Des blattes vivantes visibles, surtout **la nuit** lors des rondes

## Que faire en cas d'infestation confirmée ?

### Immédiatement

1. **Ne pas utiliser de bombes insecticides** disponibles dans le commerce : elles dispersent les colonies et aggravent le problème
2. **Prévenir votre prestataire anti-nuisibles** certifié — délai d'intervention Noxyera : 48h maximum
3. **Nettoyer en profondeur** tous les équipements et conduits accessibles

### Pendant l'intervention

Le technicien appliquera un **gel appâtant** (substance active : imidaclopride ou fipronil) dans les zones de transit identifiées. Ce traitement agit sur l'ensemble de la colonie en 7 à 14 jours.

### Après l'intervention

- Inspection de contrôle à J+14 pour vérifier l'efficacité
- Colmatage des fissures et points d'entrée identifiés
- Mise à jour de votre rapport HACCP avec le compte-rendu d'intervention

## Mesures préventives pour éviter une récidive

- Nettoyer les joints de carrelage et les joints en silicone tous les trimestres
- Vérifier régulièrement les arrivées d'eau et les siphons de sol
- Stocker les denrées dans des contenants hermétiques
- Former votre équipe à la détection des premiers signes

Avec le **Pest Alert Score** Noxyera, vous êtes alerté automatiquement lorsque les conditions environnementales favorisent une infestation à proximité de votre établissement.
    `.trim(),
  },
]

export function getArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug)
}
