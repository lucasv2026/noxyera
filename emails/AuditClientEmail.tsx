import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props {
  prenom: string
  nomEtablissement: string
  adresse: string
  secteur: string
  creneaux: string[]
  jours: string[]
}

const SECTEUR_LABELS: Record<string, string> = {
  restaurant: 'Restaurant / Brasserie', hotel: 'Hôtellerie',
  entrepot: 'Entrepôt / Logistique', agroalimentaire: 'Industrie agroalimentaire',
  immeuble: 'Immeuble / Bailleur', bureau: 'Bureau / Tertiaire',
}

export function AuditClientEmail({ prenom, nomEtablissement, adresse, secteur, creneaux, jours }: Props) {
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {prenom}, votre demande est confirmée !
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 8px', fontSize: '15px' }}>
        Votre demande est bien enregistrée pour{' '}
        <strong style={{ color: '#1B3A2D' }}>{nomEtablissement}</strong>.
      </Text>
      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px' }}>
        {jours.length > 0 && creneaux.length > 0 ? (
          <>Vous avez indiqué être disponible <strong style={{ color: '#1B3A2D' }}>{jours.join(', ')}</strong> en <strong style={{ color: '#1B3A2D' }}>{creneaux.join(' / ')}</strong>. </>
        ) : null}
        Un technicien Noxyera confirmera le rendez-vous exact sous <strong>24h</strong> par email et téléphone.
      </Text>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              VOTRE DEMANDE
            </td>
          </tr>
          {[
            ['Établissement', nomEtablissement],
            ['Adresse',       adresse],
            ['Secteur',       secteurLabel],
            ...(creneaux.length > 0 ? [['Créneaux',  creneaux.join(', ')]] : []),
            ...(jours.length > 0    ? [['Jours',     jours.join(', ')]]    : []),
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px', width: '40%' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table width="100%" style={{ backgroundColor: '#1B3A2D', borderRadius: '8px', padding: '20px', marginBottom: '24px', textAlign: 'center' as const }}>
        <tbody>
          <tr>
            <td>
              <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px' }}>
                Audit gratuit · Sans engagement
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                Diagnostic complet + plan de traitement personnalisé sous 48h
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <Text style={{ color: '#1A1A1A', fontSize: '14px', margin: '0 0 20px' }}>
        En attendant, vous pouvez nous joindre directement :{' '}
        <a href="mailto:lucas@agencenikita.com" style={{ color: '#F26522' }}>lucas@agencenikita.com</a>
      </Text>

      <Button
        href="https://noxyera.com"
        style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'block', textAlign: 'center' as const }}
      >
        Découvrir Noxyera →
      </Button>

      <Hr style={{ borderColor: '#F0F0F0', margin: '32px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        L&apos;équipe Noxyera<br />
        <span style={{ color: '#6B7280' }}>lucas@agencenikita.com · noxyera.com</span>
      </Text>
    </EmailLayout>
  )
}
