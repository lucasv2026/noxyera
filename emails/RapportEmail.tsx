import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props { nomSite: string; dateIntervention: string; nomTechnicien: string; scoreHaccp?: number; pdfUrl: string; dashboardUrl: string }

export function RapportEmail({ nomSite, dateIntervention, nomTechnicien, scoreHaccp, pdfUrl, dashboardUrl }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '20px', margin: '0 0 8px' }}>Votre rapport d&apos;intervention est prêt</Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px' }}>
        Suite au passage du <strong>{dateIntervention}</strong> chez <strong style={{ color: '#1B3A2D' }}>{nomSite}</strong>.
      </Text>
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Site</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{nomSite}</td></tr>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Date</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{dateIntervention}</td></tr>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Technicien</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{nomTechnicien} · Certifié Certibiocide</td></tr>
          {scoreHaccp !== undefined && <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Score HACCP</td><td style={{ color: '#27AE60', fontWeight: 'bold', textAlign: 'right' as const }}>{scoreHaccp}% — Conforme</td></tr>}
        </tbody>
      </table>
      <Button href={pdfUrl} style={{ backgroundColor: '#1B3A2D', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none', marginBottom: '12px' }}>↓ Télécharger le rapport PDF</Button>
      <Button href={dashboardUrl} style={{ backgroundColor: '#FFFFFF', color: '#1B3A2D', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none', border: '1px solid #1B3A2D' }}>Voir mon espace client →</Button>
      <Hr style={{ borderColor: '#F0F0F0', margin: '28px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '11px', margin: 0 }}>Document conforme HACCP · PMS · Certibiocide · Paquet Hygiène EU · IFS/BRC</Text>
    </EmailLayout>
  )
}
