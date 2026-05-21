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

const DISPO_LABELS: Record<string, string> = {
  'temps-plein':  'Temps plein',
  'temps-partiel':'Temps partiel',
  'week-ends':    'Week-ends',
  'flexible':     'Flexible',
}

export function CandidatureConfirmEmail({ prenom, ville, experience, certifications, disponibilite }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {prenom},
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px' }}>
        Nous avons bien reçu votre candidature pour rejoindre le réseau Noxyera.
        Notre équipe l&apos;examine et revient vers vous sous <strong style={{ color: '#1B3A2D' }}>48h</strong>.
      </Text>

      {/* Récap candidature */}
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              VOTRE PROFIL
            </td>
          </tr>
          {[
            ['Zone',          ville],
            ['Expérience',    EXPERIENCE_LABELS[experience] ?? experience],
            ['Disponibilité', DISPO_LABELS[disponibilite] ?? disponibilite],
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

      <Text style={{ color: '#1A1A1A', fontSize: '14px', margin: '0 0 8px' }}>
        En attendant, découvrez comment fonctionne notre plateforme :
      </Text>

      <Button
        href="https://noxyera.com/techniciens"
        style={{ backgroundColor: '#1B3A2D', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none' }}
      >
        Découvrir la plateforme →
      </Button>

      <Hr style={{ borderColor: '#F0F0F0', margin: '32px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        L&apos;équipe Noxyera<br />
        <span style={{ color: '#6B7280' }}>contact@noxyera.com · noxyera.com</span>
      </Text>
    </EmailLayout>
  )
}
