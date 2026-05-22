import * as React from 'react'
import { Heading, Text, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props {
  prenom: string
  nomEtablissement: string
}

export function AuditReceptionEmail({ prenom, nomEtablissement }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {prenom}, votre demande est bien reçue !
      </Heading>

      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px', lineHeight: '1.6' }}>
        Nous avons bien enregistré votre demande d&apos;audit pour{' '}
        <strong style={{ color: '#1B3A2D' }}>{nomEtablissement}</strong>.
      </Text>

      {/* Bloc de confirmation */}
      <table
        width="100%"
        style={{
          backgroundColor: '#F5F0E8',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '24px',
          borderLeft: '4px solid #1B3A2D',
        }}
      >
        <tbody>
          <tr>
            <td>
              <Text style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px' }}>
                ✓ Demande reçue
              </Text>
              <Text style={{ color: '#374151', fontSize: '14px', margin: '0', lineHeight: '1.6' }}>
                Un technicien Certibiocide de votre zone vous sera proposé dans les{' '}
                <strong>48 heures</strong>. Vous recevrez une confirmation avec ses
                coordonnées dès qu&apos;il sera disponible.
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <Hr style={{ borderColor: '#E5E7EB', margin: '24px 0' }} />

      <Text style={{ color: '#9CA3AF', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
        Une question ? Contactez-nous à{' '}
        <a href="mailto:contact@noxyera.com" style={{ color: '#1B3A2D' }}>
          contact@noxyera.com
        </a>
      </Text>
    </EmailLayout>
  )
}
