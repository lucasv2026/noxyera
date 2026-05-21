import * as React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail } from '../emails/WelcomeEmail'
import { RapportEmail } from '../emails/RapportEmail'
import { RappelEmail } from '../emails/RappelEmail'
import { AuditNotifEmail } from '../emails/AuditNotifEmail'

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
