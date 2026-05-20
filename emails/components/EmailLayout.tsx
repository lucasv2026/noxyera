import { Html, Head, Body, Container, Section, Text } from '@react-email/components'
import * as React from 'react'

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={{ backgroundColor: '#F5F0E8', fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Section style={{ backgroundColor: '#1B3A2D', padding: '28px 40px', borderRadius: '12px 12px 0 0', textAlign: 'center' as const }}>
            <Text style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>NOXYERA</Text>
            <Text style={{ color: '#F26522', fontSize: '11px', margin: '4px 0 0', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
              Conformité Anti-Nuisibles B2B
            </Text>
          </Section>
          <Section style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '0 0 12px 12px' }}>
            {children}
          </Section>
          <Section style={{ textAlign: 'center' as const, padding: '20px' }}>
            <Text style={{ color: '#9CA3AF', fontSize: '11px', margin: 0 }}>© 2026 Noxyera SAS · Paris, France</Text>
            <Text style={{ color: '#9CA3AF', fontSize: '11px', margin: '4px 0 0' }}>noxyera.com · contact@noxyera.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
