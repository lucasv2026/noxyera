import * as React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail } from '../emails/WelcomeEmail'
import { RapportEmail } from '../emails/RapportEmail'
import { RappelEmail } from '../emails/RappelEmail'
import { AuditNotifEmail } from '../emails/AuditNotifEmail'
import { LeadEmail, LeadNotifAdmin } from '../emails/LeadEmail'
import { CandidatureConfirmEmail } from '../emails/CandidatureConfirmEmail'
import { AuditClientEmail } from '../emails/AuditClientEmail'
import { AuditAssignEmail, AuditAdminNotifEmail } from '../emails/AuditAssignEmail'
import { AuditPlanifieClientEmail } from '../emails/AuditPlanifieClientEmail'
import { AuditReceptionEmail } from '../emails/AuditReceptionEmail'
import { MissionOffreEmail } from '../emails/MissionOffreEmail'

console.log('RESEND KEY:', process.env.RESEND_API_KEY ? 'présente' : 'MANQUANTE')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Noxyera <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'lucas@agencenikita.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noxyera.com'

export async function sendWelcomeEmail(to: string, props: { prenom: string; nomEtablissement: string; formule: string; prixAnnuel: number }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] welcome to', to); return }
  try {
    const html = await render(React.createElement(WelcomeEmail, { ...props, loginUrl: `${SITE_URL}/login` }))
    const result = await resend.emails.send({ from: FROM, to, subject: 'Bienvenue chez Noxyera — votre espace est prêt', html })
    console.log('EMAIL SENT welcome:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR welcome:', err)
  }
}

export async function sendRapportEmail(to: string, props: { nomSite: string; dateIntervention: string; nomTechnicien: string; scoreHaccp?: number; pdfUrl: string }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] rapport to', to); return }
  try {
    const html = await render(React.createElement(RapportEmail, { ...props, dashboardUrl: `${SITE_URL}/dashboard/rapports` }))
    const result = await resend.emails.send({ from: FROM, to, subject: `Rapport HACCP disponible — ${props.nomSite}`, html })
    console.log('EMAIL SENT rapport:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR rapport:', err)
  }
}

export async function sendRappelEmail(to: string, props: { nomSite: string; dateIntervention: string; heureIntervention: string; nomTechnicien: string; numeroCertibiocide: string; telephoneTechnicien: string }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] rappel to', to); return }
  try {
    const html = await render(React.createElement(RappelEmail, props))
    const result = await resend.emails.send({ from: FROM, to, subject: `Rappel intervention — ${props.nomSite} — ${props.dateIntervention}`, html })
    console.log('EMAIL SENT rappel:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR rappel:', err)
  }
}

export async function sendAuditNotifEmail(props: { nomEtablissement: string; adresse: string; secteur: string; nomContact: string; emailContact: string; telephone: string; situation: { prestataire: boolean; problemes: string; rapports: string }; disponibilites: string }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit notif'); return }
  try {
    const html = await render(React.createElement(AuditNotifEmail, { ...props, adminUrl: `${SITE_URL}/admin` }))
    const result = await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `🔔 Audit à distance — ${props.nomEtablissement}`, html })
    console.log('EMAIL SENT audit notif:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR audit notif:', err)
  }
}

// ── Lead estimateur : email prospect + notif admin ────────────────────────────
export async function sendLeadEmails(
  email: string,
  secteur: string,
  superficie: number,
  frequence: number,
  formule: string,
  prixEstime: number,
  prixBas?: number | null,
  prixHaut?: number | null,
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email mock] lead emails to', email)
    return
  }

  const bas  = prixBas  ?? Math.max(600, Math.ceil(prixEstime * 0.9 / 50) * 50)
  const haut = prixHaut ?? Math.ceil(prixEstime * 1.1 / 50) * 50

  // Email au prospect
  try {
    const htmlProspect = await render(React.createElement(LeadEmail, {
      email, secteur, superficie, frequence, formule, prixBas: bas, prixHaut: haut,
    }))
    const r1 = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Votre estimation Noxyera — ${bas.toLocaleString('fr-FR')} € à ${haut.toLocaleString('fr-FR')} €/an`,
      html: htmlProspect,
    })
    console.log('EMAIL SENT lead prospect:', JSON.stringify(r1))
  } catch (err) {
    console.error('EMAIL ERROR lead prospect:', err)
  }

  // Notif admin
  try {
    const htmlAdmin = await render(React.createElement(LeadNotifAdmin, {
      email, secteur, superficie, frequence, formule, prixEstime, prixBas: bas, prixHaut: haut,
    }))
    const r2 = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `🔔 Nouveau lead — ${secteur} ${superficie}m²`,
      html: htmlAdmin,
    })
    console.log('EMAIL SENT lead admin notif:', JSON.stringify(r2))
  } catch (err) {
    console.error('EMAIL ERROR lead admin notif:', err)
  }
}

// ── Audit : confirmation client ──────────────────────────────────────────────
export async function sendAuditClientEmail(
  to: string,
  props: { prenom: string; nomEtablissement: string; adresse: string; secteur: string; creneaux: string[]; jours: string[] }
) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit client to', to); return }
  try {
    const html = await render(React.createElement(AuditClientEmail, props))
    const result = await resend.emails.send({ from: FROM, to, subject: `Votre demande d'audit Noxyera — ${props.nomEtablissement}`, html })
    console.log('EMAIL SENT audit client:', JSON.stringify(result))
    return result
  } catch (err) { console.error('EMAIL ERROR audit client:', err) }
}

// ── Audit : notif admin (nouvelle demande) ────────────────────────────────────
export async function sendAuditAdminNotif(props: {
  nomEtablissement: string; adresse: string; secteur: string; superficie: number;
  prenom: string; nom: string; email: string; telephone: string;
  historiqueNuisibles: string; prestataireActuel: boolean; rapportsAJour: string;
  zonesSensibles: string[]; creneaux: string[]; jours: string[]
}) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit admin notif'); return }
  try {
    const html = await render(React.createElement(AuditAdminNotifEmail, props))
    const result = await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `🔔 Nouvelle demande d'audit — ${props.nomEtablissement}`, html })
    console.log('EMAIL SENT audit admin notif:', JSON.stringify(result))
    return result
  } catch (err) { console.error('EMAIL ERROR audit admin notif:', err) }
}

// ── Audit : assignation technicien ────────────────────────────────────────────
export async function sendAuditAssignEmail(
  to: string,
  props: {
    nomTechnicien: string; nomEtablissement: string; adresse: string; secteur: string;
    superficie: number; zonesSensibles: string[]; creneaux: string[]; jours: string[];
    dateAuditPrevue?: string
  }
) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit assign to', to); return }
  try {
    const html = await render(React.createElement(AuditAssignEmail, {
      ...props,
      appUrl: `${SITE_URL}/technicien/missions`,
    }))
    const result = await resend.emails.send({
      from: FROM, to,
      subject: `Nouvelle mission d'audit — ${props.nomEtablissement}`,
      html,
    })
    console.log('EMAIL SENT audit assign:', JSON.stringify(result))
    return result
  } catch (err) { console.error('EMAIL ERROR audit assign:', err) }
}

// ── Audit : confirmation client quand date planifiée ─────────────────────────
export async function sendAuditPlanifieClientEmail(
  to: string,
  props: {
    prenomClient: string; nomEtablissement: string; adresse: string;
    prenomTech: string; nomTech: string; telephoneTech: string; dateFormatted: string
  }
) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit planifie client to', to); return }
  try {
    const html = await render(React.createElement(AuditPlanifieClientEmail, props))
    const result = await resend.emails.send({
      from: FROM, to,
      subject: `Votre audit Noxyera est planifié — ${props.dateFormatted}`,
      html,
    })
    console.log('EMAIL SENT audit planifie client:', JSON.stringify(result))
    return result
  } catch (err) { console.error('EMAIL ERROR audit planifie client:', err) }
}

// ── Confirmation candidature technicien ───────────────────────────────────────
export async function sendCandidatureConfirmEmail(
  to: string,
  props: { prenom: string; nom: string; telephone: string; ville: string; code_postal: string; experience: string; certifications?: string[]; vehicule: boolean; disponibilite: string; motivation?: string }
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email mock] candidature confirm to', to)
    return
  }
  try {
    const html = await render(React.createElement(CandidatureConfirmEmail, props))
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Votre candidature Noxyera a bien été reçue',
      html,
    })
    console.log('EMAIL SENT candidature confirm:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR candidature confirm:', err)
  }
}

// ── Email de bienvenue technicien (sans mot de passe) ────────────────────────
// Envoyé après inviteUserByEmail — le lien d'activation arrive séparément via Supabase
export async function sendTechnicienBienvenueEmail(to: string, props: { prenom: string }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] technicien bienvenue to', to); return }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:28px">
          <div style="display:inline-block;background:#1B3A2D;color:#fff;padding:8px 20px;border-radius:8px;font-weight:700;font-size:18px;letter-spacing:1px">NOXYERA</div>
        </div>
        <h2 style="color:#1B3A2D;font-size:22px;margin:0 0 12px">Bienvenue ${props.prenom} !</h2>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
          Votre candidature technicien a été acceptée. Votre profil Noxyera est en cours de création.
        </p>
        <div style="background:#F5F0E8;border-left:4px solid #F26522;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
          <p style="margin:0;color:#374151;font-size:14px;font-weight:600">
            📨 Vous allez recevoir un lien d'activation sous quelques minutes.
          </p>
          <p style="margin:8px 0 0;color:#6B7280;font-size:13px">
            Ce lien vous permettra de définir votre propre mot de passe et d'accéder à vos missions.
          </p>
        </div>
        <p style="color:#6B7280;font-size:13px;margin-top:24px">
          À très bientôt,<br>
          <strong style="color:#1B3A2D">L'équipe Noxyera</strong>
        </p>
      </div>
    `
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Bienvenue chez Noxyera — votre accès technicien arrive !',
      html,
    })
    console.log('EMAIL SENT technicien bienvenue:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR technicien bienvenue:', err)
  }
}

// ── Email T1 — Offre de mission au technicien ─────────────────────────────────
// Envoyé par l'admin quand il propose une mission. Mention légale obligatoire.
export async function sendOffreMissionEmail(to: string, props: {
  prenomTechnicien: string
  nomSite: string
  adresseSite: string
  datePrevue: string
  type: string
  secteur: string
  superficie: number | null
  notesClient: string | null
  prixTechnicien: number | null
  appUrl: string
}) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] offre mission to', to); return }
  const typeLabel = props.type === 'preventif' ? 'Préventif' : props.type === 'curatif' ? 'Curatif' : 'Audit'
  const secteurLabel: Record<string, string> = {
    restaurant: 'Restaurant', hotel: 'Hôtel', entrepot: 'Entrepôt',
    agroalimentaire: 'Agroalimentaire', immeuble: 'Immeuble', bureau: 'Bureau',
  }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;background:#1B3A2D;color:#fff;padding:8px 20px;border-radius:8px;font-weight:700;font-size:18px;letter-spacing:1px">NOXYERA</div>
        </div>
        <h2 style="color:#1B3A2D;font-size:20px;margin:0 0 8px">Nouvelle offre de mission disponible</h2>
        <p style="color:#6B7280;font-size:14px;margin:0 0 20px">Bonjour ${props.prenomTechnicien},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">
          Vous pouvez accepter ou refuser cette mission depuis votre application.<br>
          <strong>Vous avez 24h pour répondre.</strong>
        </p>
        <div style="background:#F5F0E8;border-radius:12px;padding:20px 24px;margin:0 0 20px">
          <p style="font-size:16px;font-weight:700;color:#1B3A2D;margin:0 0 12px">${props.nomSite}</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151">
            <tr><td style="padding:4px 0;color:#9CA3AF;width:40%">Adresse</td><td style="padding:4px 0">${props.adresseSite}</td></tr>
            <tr><td style="padding:4px 0;color:#9CA3AF">Date</td><td style="padding:4px 0"><strong>${props.datePrevue}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#9CA3AF">Type</td><td style="padding:4px 0">${typeLabel}</td></tr>
            <tr><td style="padding:4px 0;color:#9CA3AF">Secteur</td><td style="padding:4px 0">${secteurLabel[props.secteur] ?? props.secteur}</td></tr>
            ${props.superficie ? `<tr><td style="padding:4px 0;color:#9CA3AF">Superficie</td><td style="padding:4px 0">${props.superficie} m²</td></tr>` : ''}
            ${props.prixTechnicien ? `<tr><td style="padding:4px 0;color:#9CA3AF">Rémunération</td><td style="padding:4px 0;font-weight:700;color:#1B3A2D">${props.prixTechnicien} €</td></tr>` : ''}
          </table>
          ${props.notesClient ? `<div style="margin-top:12px;padding:10px 14px;background:#fff;border-radius:8px;border-left:3px solid #F26522"><p style="font-size:12px;color:#6B7280;margin:0;font-style:italic">Notes client : ${props.notesClient}</p></div>` : ''}
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${props.appUrl}/technicien/missions" style="display:inline-block;background:#F26522;color:white;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none">
            Voir la mission →
          </a>
        </div>
        <p style="color:#9CA3AF;font-size:11px;line-height:1.5;margin-top:24px;padding-top:16px;border-top:1px solid #F3F4F6">
          Cette mission vous est proposée à titre d'offre. Vous êtes libre de l'accepter ou de la refuser sans justification.
          En cas de refus, aucune pénalité ne sera appliquée.
        </p>
      </div>
    `
    const result = await resend.emails.send({
      from: FROM, to,
      subject: 'Noxyera — Nouvelle offre de mission',
      html,
    })
    console.log('EMAIL SENT offre mission:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR offre mission:', err)
  }
}

// ── Email C3 — Confirmation intervention au client ───────────────────────────
export async function sendConfirmationInterventionEmail(to: string, props: {
  prenomClient: string
  nomSite: string
  adresseSite: string
  datePrevue: string
  nomTechnicien: string
  numeroCertibiocide: string | null
}) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] confirmation intervention to', to); return }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;background:#1B3A2D;color:#fff;padding:8px 20px;border-radius:8px;font-weight:700;font-size:18px;letter-spacing:1px">NOXYERA</div>
        </div>
        <div style="display:inline-flex;align-items:center;gap:8px;background:#D1FAE5;padding:8px 16px;border-radius:20px;margin-bottom:20px">
          <span style="color:#065F46;font-size:13px;font-weight:600">✓ Intervention confirmée</span>
        </div>
        <h2 style="color:#1B3A2D;font-size:20px;margin:0 0 8px">Votre intervention est confirmée</h2>
        <p style="color:#6B7280;font-size:14px;margin:0 0 20px">Bonjour ${props.prenomClient},</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">
          Votre intervention sur le site <strong>${props.nomSite}</strong> est planifiée.
        </p>
        <div style="background:#F5F0E8;border-radius:12px;padding:20px 24px;margin:0 0 20px">
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#374151">
            <tr><td style="padding:5px 0;color:#9CA3AF;width:40%">Site</td><td style="padding:5px 0;font-weight:600">${props.nomSite}</td></tr>
            <tr><td style="padding:5px 0;color:#9CA3AF">Adresse</td><td style="padding:5px 0">${props.adresseSite}</td></tr>
            <tr><td style="padding:5px 0;color:#9CA3AF">Date</td><td style="padding:5px 0;font-weight:700;color:#1B3A2D">${props.datePrevue}</td></tr>
            <tr><td style="padding:5px 0;color:#9CA3AF">Technicien</td><td style="padding:5px 0">${props.nomTechnicien}</td></tr>
            ${props.numeroCertibiocide ? `<tr><td style="padding:5px 0;color:#9CA3AF">N° Certibiocide</td><td style="padding:5px 0;font-family:monospace">${props.numeroCertibiocide}</td></tr>` : ''}
          </table>
        </div>
        <p style="color:#6B7280;font-size:13px;line-height:1.6">
          Le technicien se présentera muni de son attestation Certibiocide.
          Un rapport HACCP sera disponible dans votre espace client sous 24h après l'intervention.
        </p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          À bientôt,<br><strong style="color:#1B3A2D">L'équipe Noxyera</strong>
        </p>
      </div>
    `
    const result = await resend.emails.send({
      from: FROM, to,
      subject: `Votre intervention est confirmée — ${props.nomSite}`,
      html,
    })
    console.log('EMAIL SENT confirmation intervention:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR confirmation intervention:', err)
  }
}

// ── Email admin — Mission refusée par technicien ─────────────────────────────
export async function sendMissionRefuseeAdminEmail(props: {
  interventionId: string
  nomSite: string
  datePrevue: string
  adminPlanningUrl: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!process.env.RESEND_API_KEY || !adminEmail) { console.log('[Email mock] mission refusee admin'); return }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px 20px;margin-bottom:20px">
          <p style="font-size:15px;font-weight:700;color:#92400E;margin:0">⚠️ Offre de mission refusée — action requise</p>
        </div>
        <p style="color:#374151;font-size:14px;line-height:1.6">
          Un technicien a refusé une offre de mission. Vous devez reproposer à un autre technicien disponible.
        </p>
        <div style="background:#F5F0E8;border-radius:10px;padding:16px 20px;margin:16px 0">
          <table style="font-size:13px;color:#374151;border-collapse:collapse">
            <tr><td style="padding:3px 0;color:#9CA3AF;width:40%">Intervention</td><td style="padding:3px 0">#${props.interventionId.slice(0, 8)}</td></tr>
            <tr><td style="padding:3px 0;color:#9CA3AF">Site</td><td style="padding:3px 0;font-weight:600">${props.nomSite}</td></tr>
            <tr><td style="padding:3px 0;color:#9CA3AF">Date prévue</td><td style="padding:3px 0">${props.datePrevue}</td></tr>
          </table>
        </div>
        <a href="${props.adminPlanningUrl}" style="display:inline-block;background:#1B3A2D;color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin-top:8px">
          Ouvrir le planning →
        </a>
      </div>
    `
    const result = await resend.emails.send({
      from: FROM, to: adminEmail,
      subject: '⚠️ Offre de mission refusée — à reproposer',
      html,
    })
    console.log('EMAIL SENT mission refusee admin:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR mission refusee admin:', err)
  }
}

// ── Email admin — Mission expirée (pas de réponse en 24h) ────────────────────
export async function sendMissionExpireedAdminEmail(props: {
  interventionId: string
  nomSite: string
  datePrevue: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!process.env.RESEND_API_KEY || !adminEmail) { console.log('[Email mock] mission expiree admin'); return }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="background:#FEE2E2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:20px">
          <p style="font-size:15px;font-weight:700;color:#991B1B;margin:0">⏰ Offre de mission expirée — aucune réponse en 24h</p>
        </div>
        <p style="color:#374151;font-size:14px;line-height:1.6">
          Le technicien n'a pas répondu à l'offre dans les 24h. La mission est à reproposer.
        </p>
        <div style="background:#F5F0E8;border-radius:10px;padding:16px 20px;margin:16px 0">
          <table style="font-size:13px;color:#374151;border-collapse:collapse">
            <tr><td style="padding:3px 0;color:#9CA3AF;width:40%">Intervention</td><td style="padding:3px 0">#${props.interventionId.slice(0, 8)}</td></tr>
            <tr><td style="padding:3px 0;color:#9CA3AF">Site</td><td style="padding:3px 0;font-weight:600">${props.nomSite}</td></tr>
            <tr><td style="padding:3px 0;color:#9CA3AF">Date prévue</td><td style="padding:3px 0">${props.datePrevue}</td></tr>
          </table>
        </div>
      </div>
    `
    const result = await resend.emails.send({
      from: FROM, to: adminEmail,
      subject: '⏰ Offre de mission expirée — à reproposer',
      html,
    })
    console.log('EMAIL SENT mission expiree admin:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR mission expiree admin:', err)
  }
}

// ── Email C2 — Réception demande d'audit (AUCUN technicien assigné à ce stade) ──
// Déclenché uniquement dans audit/route.ts, jamais depuis accept/route.ts
export async function sendAuditReceptionEmail(to: string, props: { prenom: string; nomEtablissement: string }) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] audit reception to', to); return }
  try {
    const html = await render(React.createElement(AuditReceptionEmail, props))
    const result = await resend.emails.send({
      from: FROM, to,
      subject: 'Votre demande a bien été reçue — Noxyera',
      html,
    })
    console.log('EMAIL SENT audit reception:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR audit reception:', err)
  }
}

// ── Email T1 (template) — Offre de mission au technicien ─────────────────────
// Version react-email avec bloc expiration amber et mention légale obligatoire
interface MissionOffreProps {
  prenomTech: string
  nomSite: string
  adresse: string
  secteur: string
  superficie: number | null
  datePrevue: string
  type: 'preventif' | 'curatif' | 'audit'
  notesClient: string | null
  expiresAt: string
  appUrl: string
}

export async function sendMissionOffreEmail(to: string, props: MissionOffreProps) {
  if (!process.env.RESEND_API_KEY) { console.log('[Email mock] mission offre to', to); return }
  try {
    const html = await render(React.createElement(MissionOffreEmail, props))
    const result = await resend.emails.send({
      from: FROM, to,
      subject: 'Noxyera — Nouvelle offre de mission',
      html,
    })
    console.log('EMAIL SENT mission offre (template):', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('EMAIL ERROR mission offre (template):', err)
  }
}
