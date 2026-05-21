import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

// ── Email technicien — assignation audit ─────────────────────────────────────
interface AuditAssignProps {
  nomTechnicien: string
  nomEtablissement: string
  adresse: string
  secteur: string
  superficie: number
  zonesSensibles: string[]
  creneaux: string[]
  jours: string[]
  dateAuditPrevue?: string
  appUrl: string
}

const SECTEUR_LABELS: Record<string, string> = {
  restaurant: 'Restaurant / Brasserie', hotel: 'Hôtellerie',
  entrepot: 'Entrepôt / Logistique', agroalimentaire: 'Industrie agroalimentaire',
  immeuble: 'Immeuble / Bailleur', bureau: 'Bureau / Tertiaire',
}

export function AuditAssignEmail({
  nomTechnicien, nomEtablissement, adresse, secteur, superficie,
  zonesSensibles, creneaux, jours, dateAuditPrevue, appUrl,
}: AuditAssignProps) {
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {nomTechnicien},
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px' }}>
        Une nouvelle mission d&apos;audit vous a été assignée.
      </Text>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              DÉTAILS DE L&apos;AUDIT
            </td>
          </tr>
          {[
            ['Établissement', nomEtablissement],
            ['Adresse',       adresse],
            ['Secteur',       secteurLabel],
            ['Superficie',    `${superficie.toLocaleString('fr-FR')} m²`],
            ...(zonesSensibles.length > 0 ? [['Zones sensibles', zonesSensibles.join(', ')]] : []),
            ...(creneaux.length > 0       ? [['Créneaux client',  creneaux.join(', ')]]       : []),
            ...(jours.length > 0          ? [['Jours client',     jours.join(', ')]]           : []),
            ...(dateAuditPrevue ? [['Date prévue', dateAuditPrevue]] : []),
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px', width: '40%' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        href={appUrl}
        style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'block', textAlign: 'center' as const }}
      >
        Voir les détails dans l&apos;app →
      </Button>

      <Hr style={{ borderColor: '#F0F0F0', margin: '32px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        Noxyera — Plateforme techniciens<br />
        <span style={{ color: '#6B7280' }}>contact@noxyera.com</span>
      </Text>
    </EmailLayout>
  )
}

// ── Email admin — nouvelle demande d'audit ────────────────────────────────────
interface AuditAdminNotifProps {
  nomEtablissement: string
  adresse: string
  secteur: string
  superficie: number
  prenom: string
  nom: string
  email: string
  telephone: string
  historiqueNuisibles: string
  prestataireActuel: boolean
  rapportsAJour: string
  zonesSensibles: string[]
  creneaux: string[]
  jours: string[]
}

const HIST_LABELS: Record<string, string> = {
  oui_recent: 'Oui, récemment',
  oui_ancien: 'Oui, il y a plus d\'un an',
  jamais:     'Jamais',
  sais_pas:   'Je ne sais pas',
}

export function AuditAdminNotifEmail({
  nomEtablissement, adresse, secteur, superficie, prenom, nom, email, telephone,
  historiqueNuisibles, prestataireActuel, rapportsAJour, zonesSensibles, creneaux, jours,
}: AuditAdminNotifProps) {
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '20px', margin: '0 0 16px' }}>
        🔔 Nouvelle demande d&apos;audit
      </Heading>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
        <tbody>
          <tr><td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '10px' }} colSpan={2}>ÉTABLISSEMENT</td></tr>
          {[
            ['Nom',       nomEtablissement],
            ['Adresse',   adresse],
            ['Secteur',   secteurLabel],
            ['Superficie',`${superficie.toLocaleString('fr-FR')} m²`],
          ].map(([k, v]) => (
            <tr key={k}><td style={{ color: '#6B7280', padding: '5px 0', fontSize: '13px', width: '35%' }}>{k}</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '13px' }}>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <table width="100%" style={{ backgroundColor: '#FFF5EE', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
        <tbody>
          <tr><td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '10px' }} colSpan={2}>CONTACT</td></tr>
          {[
            ['Nom',       `${prenom} ${nom}`],
            ['Email',     email],
            ['Téléphone', telephone],
          ].map(([k, v]) => (
            <tr key={k}><td style={{ color: '#6B7280', padding: '5px 0', fontSize: '13px', width: '35%' }}>{k}</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '13px' }}>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr><td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '10px' }} colSpan={2}>SITUATION</td></tr>
          {[
            ['Nuisibles',     HIST_LABELS[historiqueNuisibles] ?? historiqueNuisibles],
            ['Prestataire',   prestataireActuel ? 'Oui' : 'Non'],
            ['Rapports HACCP',rapportsAJour],
            ...(zonesSensibles.length > 0 ? [['Zones sensibles', zonesSensibles.join(', ')]] : []),
            ...(creneaux.length > 0       ? [['Créneaux',        creneaux.join(', ')]]        : []),
            ...(jours.length > 0          ? [['Jours',           jours.join(', ')]]            : []),
          ].map(([k, v]) => (
            <tr key={k}><td style={{ color: '#6B7280', padding: '5px 0', fontSize: '13px', width: '35%' }}>{k}</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '13px' }}>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <Text style={{ color: '#F26522', fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px' }}>
        À traiter sous 48h
      </Text>
      <Button
        href={`mailto:${email}?subject=Votre demande d'audit Noxyera&body=Bonjour ${prenom},%0A%0A`}
        style={{ backgroundColor: '#1B3A2D', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}
      >
        Répondre à {email} →
      </Button>
    </EmailLayout>
  )
}
