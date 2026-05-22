import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

const TYPE_LABELS: Record<string, string> = {
  preventif: 'Traitement préventif',
  curatif:   'Traitement curatif',
  audit:     'Audit sanitaire',
}

const SECTEUR_LABELS: Record<string, string> = {
  restaurant:      'Restaurant',
  hotel:           'Hôtel',
  entrepot:        'Entrepôt',
  agroalimentaire: 'Agroalimentaire',
  immeuble:        'Immeuble',
  bureau:          'Bureau',
}

interface Props {
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

export function MissionOffreEmail({
  prenomTech,
  nomSite,
  adresse,
  secteur,
  superficie,
  datePrevue,
  type,
  notesClient,
  expiresAt,
  appUrl,
}: Props) {
  const typeLabel = TYPE_LABELS[type] ?? type
  const secteurLabel = SECTEUR_LABELS[secteur] ?? secteur
  const expiresFormatted = new Date(expiresAt).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })

  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Nouvelle offre de mission
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 20px', fontSize: '15px' }}>
        Bonjour {prenomTech},
      </Text>
      <Text style={{ color: '#374151', margin: '0 0 20px', fontSize: '15px', lineHeight: '1.6' }}>
        Une nouvelle offre de mission est disponible dans votre zone.
        Vous avez jusqu&apos;au{' '}
        <strong style={{ color: '#1B3A2D' }}>{expiresFormatted}</strong>{' '}
        pour l&apos;accepter ou la refuser depuis votre application.
      </Text>

      {/* Bloc expiration — fond amber */}
      <table
        width="100%"
        style={{
          backgroundColor: '#FFF7ED',
          border: '1px solid #FDE68A',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '20px',
        }}
      >
        <tbody>
          <tr>
            <td>
              <Text style={{ color: '#92400E', fontWeight: 'bold', fontSize: '13px', margin: 0 }}>
                ⏰ Offre valable jusqu&apos;au {expiresFormatted}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bloc détails mission */}
      <table
        width="100%"
        style={{
          backgroundColor: '#F5F0E8',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
      >
        <tbody>
          <tr>
            <td
              colSpan={2}
              style={{
                color: '#6B7280', fontSize: '11px',
                textTransform: 'uppercase' as const,
                letterSpacing: '1px', paddingBottom: '12px',
              }}
            >
              DÉTAILS DE LA MISSION
            </td>
          </tr>
          <tr>
            <td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '16px', paddingBottom: '12px' }} colSpan={2}>
              {nomSite}
            </td>
          </tr>
          {[
            ['Adresse',   adresse],
            ['Date',      datePrevue],
            ['Type',      typeLabel],
            ['Secteur',   secteurLabel],
            ...(superficie ? [['Superficie', `${superficie} m²`]] : []),
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#9CA3AF', fontSize: '13px', padding: '4px 0', width: '38%' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: '600', fontSize: '13px', padding: '4px 0' }}>{v}</td>
            </tr>
          ))}
          {notesClient && (
            <tr>
              <td colSpan={2} style={{ paddingTop: '12px' }}>
                <table width="100%" style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '10px 14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#6B7280', fontSize: '12px', fontStyle: 'italic' }}>
                        Notes client : {notesClient}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* CTA */}
      <Button
        href={`${appUrl}/technicien/missions`}
        style={{
          backgroundColor: '#F26522',
          color: '#FFFFFF',
          padding: '14px 32px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '15px',
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center' as const,
        }}
      >
        Voir l&apos;offre dans l&apos;app →
      </Button>

      <Hr style={{ borderColor: '#E5E7EB', margin: '28px 0 20px' }} />

      {/* Mention légale obligatoire */}
      <Text style={{ color: '#9CA3AF', fontSize: '11px', lineHeight: '1.6', margin: 0 }}>
        Vous êtes libre d&apos;accepter ou de refuser cette offre sans justification.
        Ceci est une proposition commerciale, non une obligation contractuelle.
        En cas de refus, aucune pénalité n&apos;est appliquée.
      </Text>
    </EmailLayout>
  )
}
