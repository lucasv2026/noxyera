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

console.log('RESEND KEY:', process.env.RESEND_API_KEY ? 'présente' : 'MANQUANTE')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Noxyera <onboarding@resend.dev>'
const ADMIN_EMAIL = 'lucas@agencenikita.com'
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
