import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props { prenom: string; nomEtablissement: string; formule: string; prixAnnuel: number; loginUrl: string }

export function WelcomeEmail({ prenom, nomEtablissement, formule, prixAnnuel, loginUrl }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>Bienvenue, {prenom} 👋</Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px' }}>
        Votre espace Noxyera est prêt pour <strong style={{ color: '#1B3A2D' }}>{nomEtablissement}</strong>.
      </Text>
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr><td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>VOTRE CONTRAT</td></tr>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Établissement</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{nomEtablissement}</td></tr>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Formule</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{formule.charAt(0).toUpperCase() + formule.slice(1)}</td></tr>
          <tr><td style={{ color: '#6B7280', padding: '6px 0' }}>Tarif annuel</td><td style={{ color: '#F26522', fontWeight: 'bold', textAlign: 'right' as const, fontSize: '20px' }}>{prixAnnuel} €</td></tr>
        </tbody>
      </table>
      {[
        { icon: '📄', text: 'Rapports HACCP générés automatiquement après chaque passage' },
        { icon: '🔔', text: 'Alertes en cas de risque détecté dans votre zone' },
        { icon: '👨‍🔧', text: 'Technicien certifié Certibiocide dédié à votre établissement' },
      ].map(f => <Text key={f.text} style={{ color: '#1A1A1A', margin: '8px 0', fontSize: '14px' }}>{f.icon} {f.text}</Text>)}
      <Button href={loginUrl} style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, marginTop: '28px', textDecoration: 'none' }}>
        Accéder à mon espace →
      </Button>
      <Hr style={{ borderColor: '#F0F0F0', margin: '32px 0' }} />
      <Text style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
        Une question ? Répondez directement à cet email.<br /><strong style={{ color: '#1B3A2D' }}>Équipe Noxyera</strong>
      </Text>
    </EmailLayout>
  )
}
