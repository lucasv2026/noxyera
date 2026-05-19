export interface EmailData {
  subject: string
  html: string
}

const baseStyles = {
  wrapper: 'font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;',
  container: 'max-width: 600px; margin: 0 auto; background-color: #ffffff;',
  header: 'background-color: #1B3A2D; padding: 32px 40px; text-align: center;',
  headerTitle: 'color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 0;',
  headerSubtitle: 'color: #a3c4a8; font-size: 13px; margin: 6px 0 0 0; letter-spacing: 1px;',
  body: 'padding: 40px;',
  h1: 'color: #1B3A2D; font-size: 22px; font-weight: bold; margin: 0 0 16px 0;',
  p: 'color: #444444; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;',
  infoBox: 'background-color: #f8faf8; border-left: 4px solid #1B3A2D; padding: 20px 24px; margin: 24px 0; border-radius: 0 6px 6px 0;',
  infoRow: 'color: #333333; font-size: 14px; line-height: 1.8; margin: 0;',
  infoLabel: 'font-weight: bold; color: #1B3A2D;',
  ctaWrapper: 'text-align: center; margin: 32px 0;',
  ctaButton: 'display: inline-block; background-color: #F26522; color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 6px; text-decoration: none;',
  divider: 'border: none; border-top: 1px solid #e8e8e8; margin: 32px 0;',
  footer: 'background-color: #f4f4f4; padding: 24px 40px; text-align: center;',
  footerText: 'color: #888888; font-size: 12px; margin: 0; line-height: 1.6;',
  badge: 'display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold;',
  badgeGreen: 'background-color: #e6f4ea; color: #1B7A3A;',
  badgeRed: 'background-color: #fdecea; color: #c62828;',
}

function buildLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Noxyera</title>
</head>
<body style="${baseStyles.wrapper}">
  <table width="100%" cellpadding="0" cellspacing="0" style="${baseStyles.wrapper}">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="${baseStyles.container}">
          <!-- Header -->
          <tr>
            <td style="${baseStyles.header}">
              <p style="${baseStyles.headerTitle}">NOXYERA</p>
              <p style="${baseStyles.headerSubtitle}">Protection Sanitaire Professionnelle</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="${baseStyles.body}">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="${baseStyles.footer}">
              <p style="${baseStyles.footerText}">
                © 2026 Noxyera SAS · <a href="mailto:contact@noxyera.com" style="color: #1B3A2D;">contact@noxyera.com</a><br>
                Ce message est envoyé automatiquement, merci de ne pas y répondre directement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Template 1: J-7 before intervention
export function emailIntervention7j(params: {
  clientNom: string
  siteNom: string
  adresse: string
  dateIntervention: string
  technicienNom: string
}): EmailData {
  const { clientNom, siteNom, adresse, dateIntervention, technicienNom } = params

  const content = `
    <h1 style="${baseStyles.h1}">Votre intervention est confirmée</h1>
    <p style="${baseStyles.p}">Bonjour ${clientNom},</p>
    <p style="${baseStyles.p}">
      Nous vous rappelons qu'un technicien Noxyera interviendra sur votre établissement dans <strong>7 jours</strong>.
      Voici le récapitulatif de votre prochaine visite :
    </p>

    <div style="${baseStyles.infoBox}">
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Établissement :</span> ${siteNom}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Adresse :</span> ${adresse}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Date & heure :</span> ${dateIntervention}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Technicien :</span> ${technicienNom}
      </p>
    </div>

    <p style="${baseStyles.p}">
      Pour garantir l'efficacité de l'intervention, nous vous recommandons de vous assurer que les zones concernées
      (cuisines, réserves, locaux techniques) soient accessibles à l'heure prévue.
    </p>

    <hr style="${baseStyles.divider}">

    <p style="${baseStyles.p}" style="color: #888888; font-size: 13px;">
      Une question ? Contactez-nous à <a href="mailto:contact@noxyera.com" style="color: #1B3A2D;">contact@noxyera.com</a>
    </p>
  `

  return {
    subject: `[Noxyera] Rappel : intervention prévue dans 7 jours – ${siteNom}`,
    html: buildLayout(content),
  }
}

// Template 2: Rapport disponible post-intervention
export function emailRapportDisponible(params: {
  clientNom: string
  siteNom: string
  dateIntervention: string
  pdfUrl: string
  numeroRapport: string
  haccpConforme: boolean
}): EmailData {
  const { clientNom, siteNom, dateIntervention, pdfUrl, numeroRapport, haccpConforme } = params

  const conformeBadge = haccpConforme
    ? `<span style="${baseStyles.badge} ${baseStyles.badgeGreen}">✓ HACCP Conforme</span>`
    : `<span style="${baseStyles.badge} ${baseStyles.badgeRed}">⚠ Points à corriger</span>`

  const conformeText = haccpConforme
    ? `Votre établissement est <strong>conforme aux normes HACCP</strong>. Aucune action corrective n'est requise.`
    : `Notre rapport identifie <strong>des points à corriger</strong> pour atteindre la conformité HACCP. Consultez le rapport pour les recommandations détaillées.`

  const content = `
    <h1 style="${baseStyles.h1}">Votre rapport HACCP est disponible</h1>
    <p style="${baseStyles.p}">Bonjour ${clientNom},</p>
    <p style="${baseStyles.p}">
      Suite à l'intervention réalisée sur votre établissement, votre rapport de contrôle sanitaire est maintenant disponible.
    </p>

    <div style="${baseStyles.infoBox}">
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Établissement :</span> ${siteNom}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Date d'intervention :</span> ${dateIntervention}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">N° de rapport :</span> ${numeroRapport}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Statut HACCP :</span> ${conformeBadge}
      </p>
    </div>

    <p style="${baseStyles.p}">${conformeText}</p>

    <div style="${baseStyles.ctaWrapper}">
      <a href="${pdfUrl}" style="${baseStyles.ctaButton}" target="_blank">
        Télécharger le rapport PDF
      </a>
    </div>

    <p style="${baseStyles.p}" style="color: #888888; font-size: 13px; text-align: center;">
      Ce rapport est disponible pendant 12 mois dans votre espace client Noxyera.
    </p>

    <hr style="${baseStyles.divider}">

    <p style="${baseStyles.p}" style="color: #888888; font-size: 13px;">
      Une question sur ce rapport ? Contactez-nous à <a href="mailto:contact@noxyera.com" style="color: #1B3A2D;">contact@noxyera.com</a>
    </p>
  `

  return {
    subject: `[Noxyera] Rapport HACCP disponible – ${siteNom} – ${numeroRapport}`,
    html: buildLayout(content),
  }
}

// Template 3: Nouveau lead (internal notification)
export function emailNouveauLead(params: {
  email: string
  secteur: string
  superficie: number
  prixEstime: number
  formuleSuggeree: string
  scoreGlobal?: number
  nomEtablissement?: string
}): EmailData {
  const { email, secteur, superficie, prixEstime, formuleSuggeree, scoreGlobal, nomEtablissement } = params

  const scoreHtml = typeof scoreGlobal === 'number'
    ? `<p style="${baseStyles.infoRow}"><span style="${baseStyles.infoLabel}">Score de risque :</span> ${scoreGlobal}/10</p>`
    : ''

  const etablissementHtml = nomEtablissement
    ? `<p style="${baseStyles.infoRow}"><span style="${baseStyles.infoLabel}">Établissement :</span> ${nomEtablissement}</p>`
    : ''

  const formuleLabel = formuleSuggeree === 'serenite' ? 'Sérénité' : 'Essentiel'
  const prixFormate = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prixEstime)

  const content = `
    <h1 style="${baseStyles.h1}">🔔 Nouveau lead entrant</h1>
    <p style="${baseStyles.p}">
      Un prospect vient de remplir l'estimateur de tarif sur noxyera.com.
    </p>

    <div style="${baseStyles.infoBox}">
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Email :</span> <a href="mailto:${email}" style="color: #1B3A2D;">${email}</a>
      </p>
      ${etablissementHtml}
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Secteur :</span> ${secteur}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Superficie :</span> ${superficie} m²
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Formule suggérée :</span> ${formuleLabel}
      </p>
      <p style="${baseStyles.infoRow}">
        <span style="${baseStyles.infoLabel}">Prix estimé :</span> <strong>${prixFormate} / an</strong>
      </p>
      ${scoreHtml}
    </div>

    <div style="${baseStyles.ctaWrapper}">
      <a href="mailto:${email}?subject=Votre%20estimation%20Noxyera&body=Bonjour%2C%0A%0AJ'ai%20bien%20re%C3%A7u%20votre%20demande%20d'estimation%20Noxyera..." style="${baseStyles.ctaButton}">
        Répondre au prospect
      </a>
    </div>

    <hr style="${baseStyles.divider}">

    <p style="color: #888888; font-size: 13px; margin: 0;">
      Cet email est généré automatiquement par l'estimateur Noxyera.
      Connectez-vous au <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/admin/leads" style="color: #1B3A2D;">tableau de bord admin</a> pour voir tous les leads.
    </p>
  `

  return {
    subject: `[Noxyera] Nouveau lead – ${email} – ${formuleLabel} – ${prixFormate}`,
    html: buildLayout(content),
  }
}
