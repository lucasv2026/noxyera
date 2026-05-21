import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props {
  prenom: string
  ville: string
  experience: string
  certifications?: string[]
  disponibilite: string
}

const EXPERIENCE_LABELS: Record<string, string> = {
  '0-1an':  'Moins d\'1 an',
  '1-3ans': '1 à 3 ans',
  '3-5ans': '3 à 5 ans',
  '5ans+':  'Plus de 5 ans',
}


export function CandidatureConfirmEmail({ prenom, ville, experience, certifications, disponibilite }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {prenom},
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 16px', fontSize: '15px' }}>
        Nous avons bien reçu votre candidature pour rejoindre le réseau de techniciens Noxyera. Merci de votre intérêt.
      </Text>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              RÉCAP DE VOTRE CANDIDATURE
            </td>
          </tr>
          {[
            ['Zone',          ville],
            ['Expérience',    EXPERIENCE_LABELS[experience] ?? experience],
            ...(certifications && certifications.length > 0
              ? [['Certifications', certifications.join(', ')]]
              : []),
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const, fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Text style={{ color: '#1A1A1A', fontSize: '14px', margin: '0 0 16px' }}>
        Notre équipe étudie votre dossier et reviendra vers vous sous <strong>48h</strong>.
        Si votre profil correspond à nos besoins actuels, nous vous proposerons un échange téléphonique.
      </Text>

      <Text style={{ color: '#1A1A1A', fontSize: '14px', margin: '0 0 20px' }}>
        En attendant, vous pouvez nous contacter directement :{' '}
        <a href="mailto:lucas@agencenikita.com" style={{ color: '#F26522' }}>lucas@agencenikita.com</a>
      </Text>

      <Hr style={{ borderColor: '#F0F0F0', margin: '24px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        L&apos;équipe Noxyera<br />
        <span style={{ color: '#6B7280' }}>lucas@agencenikita.com · noxyera.com</span>
      </Text>
    </EmailLayout>
  )
}
