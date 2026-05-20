import * as React from 'react'
import { Heading, Text, Button } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props { nomSite: string; dateIntervention: string; heureIntervention: string; nomTechnicien: string; numeroCertibiocide: string; telephoneTechnicien: string }

export function RappelEmail({ nomSite, dateIntervention, heureIntervention, nomTechnicien, numeroCertibiocide, telephoneTechnicien }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '20px', margin: '0 0 8px' }}>📅 Rappel — Intervention dans 3 jours</Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px' }}>Un technicien Noxyera passera chez <strong style={{ color: '#1B3A2D' }}>{nomSite}</strong>.</Text>
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          {[['Date', dateIntervention], ['Heure prévue', heureIntervention], ['Site', nomSite], ['Technicien', nomTechnicien], ['N° Certibiocide', numeroCertibiocide], ['Contact direct', telephoneTechnicien]].map(([l, v]) => (
            <tr key={l}><td style={{ color: '#6B7280', padding: '6px 0' }}>{l}</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{v}</td></tr>
          ))}
        </tbody>
      </table>
      <Button href="https://noxyera.com/dashboard" style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none' }}>Voir mon planning →</Button>
    </EmailLayout>
  )
}
