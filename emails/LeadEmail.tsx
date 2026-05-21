import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

// ── Email prospect ────────────────────────────────────────────────────────────
interface LeadEmailProps {
  email: string
  secteur: string
  superficie: number
  frequence: number
  formule: string
  prixBas: number
  prixHaut: number
}

const SECTEUR_LABELS: Record<string, string> = {
  restaurant: 'Restaurant / Brasserie',
  hotel: 'Hôtel / Hébergement',
  entrepot: 'Entrepôt / Logistique',
  agroalimentaire: 'Industrie agroalimentaire',
  immeuble: 'Immeuble / Bailleur',
  bureau: 'Bureau / Tertiaire',
}

const FREQ_LABELS: Record<number, string> = {
  4: '4 passages / an (trimestriel)',
  6: '6 passages / an (bimestriel)',
  12: '12 passages / an (mensuel)',
}

export function LeadEmail({ email, secteur, superficie, frequence, formule, prixBas, prixHaut }: LeadEmailProps) {
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur
  const freqLabel    = FREQ_LABELS[frequence] ?? `${frequence} passages / an`
  const formuleLabel = formule === 'serenite' ? 'Sérénité' : 'Essentiel'
  const subject      = `Votre estimation Noxyera — ${prixBas.toLocaleString('fr-FR')} € à ${prixHaut.toLocaleString('fr-FR')} €/an`

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Votre estimation Noxyera
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px' }}>
        Merci pour votre demande. Voici le récapitulatif de votre estimation.
      </Text>

      {/* Récap paramètres */}
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              VOTRE CONFIGURATION
            </td>
          </tr>
          {[
            ['Secteur',    secteurLabel],
            ['Superficie', `${superficie.toLocaleString('fr-FR')} m²`],
            ['Fréquence',  freqLabel],
            ['Formule',    formuleLabel],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const, fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Prix fourchette */}
      <table width="100%" style={{ backgroundColor: '#1B3A2D', borderRadius: '8px', padding: '24px', marginBottom: '24px', textAlign: 'center' as const }}>
        <tbody>
          <tr>
            <td>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 8px' }}>
                ESTIMATION ANNUELLE HT
              </Text>
              <Text style={{ color: '#F26522', fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px' }}>
                Entre {prixBas.toLocaleString('fr-FR')} € et {prixHaut.toLocaleString('fr-FR')} €
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                Estimation indicative · Devis précis sous 24h
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <Hr style={{ borderColor: '#F0F0F0', margin: '24px 0' }} />

      <Text style={{ color: '#1B3A2D', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px' }}>
        L&apos;étape suivante : votre audit gratuit
      </Text>
      <Text style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px' }}>
        Pour obtenir un devis exact et un plan de traitement personnalisé, nous proposons un audit gratuit de votre établissement.
        Cela commence par une analyse à distance qui nous permet de comprendre vos besoins avant l&apos;intervention d&apos;un technicien sur site.
      </Text>

      <Button
        href={`https://noxyera.vercel.app/audit?secteur=${secteur}&superficie=${superficie}`}
        style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none' }}
      >
        Faire mon audit gratuit →
      </Button>

      <Hr style={{ borderColor: '#F0F0F0', margin: '32px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        Lucas, fondateur de Noxyera<br />
        <span style={{ color: '#6B7280' }}>lucas@agencenikita.com · noxyera.com</span>
      </Text>
    </EmailLayout>
  )
}

// ── Email admin (notification interne) ───────────────────────────────────────
interface LeadNotifAdminProps {
  email: string
  secteur: string
  superficie: number
  frequence: number
  formule: string
  prixEstime: number
  prixBas?: number | null
  prixHaut?: number | null
}

export function LeadNotifAdmin({ email, secteur, superficie, frequence, formule, prixEstime, prixBas, prixHaut }: LeadNotifAdminProps) {
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur
  const freqLabel    = FREQ_LABELS[frequence] ?? `${frequence}×/an`

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '20px', margin: '0 0 16px' }}>
        🔔 Nouveau lead estimateur
      </Heading>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          {[
            ['Email',      email],
            ['Secteur',    secteurLabel],
            ['Superficie', `${superficie.toLocaleString('fr-FR')} m²`],
            ['Fréquence',  freqLabel],
            ['Formule',    formule === 'serenite' ? 'Sérénité' : 'Essentiel'],
            ['Prix estimé', `${prixEstime.toLocaleString('fr-FR')} €/an`],
            ...(prixBas && prixHaut ? [['Fourchette', `${prixBas.toLocaleString('fr-FR')} — ${prixHaut.toLocaleString('fr-FR')} €`]] : []),
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px', width: '40%' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Text style={{ color: '#F26522', fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px' }}>
        À rappeler sous 24h
      </Text>
      <Button
        href={`mailto:${email}?subject=Votre devis Noxyera&body=Bonjour,%0A%0AJ'ai bien reçu votre demande via noxyera.com.%0A`}
        style={{ backgroundColor: '#1B3A2D', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}
      >
        Répondre à {email} →
      </Button>
    </EmailLayout>
  )
}
