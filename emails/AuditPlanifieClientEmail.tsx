import * as React from 'react'
import { Heading, Text, Button, Hr } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props {
  prenomClient: string
  nomEtablissement: string
  adresse: string
  prenomTech: string
  nomTech: string
  telephoneTech: string
  dateFormatted: string
}

export function AuditPlanifieClientEmail({
  prenomClient, nomEtablissement, adresse,
  prenomTech, nomTech, telephoneTech, dateFormatted,
}: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '22px', margin: '0 0 8px' }}>
        Bonjour {prenomClient}, votre audit est planifié !
      </Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '15px' }}>
        <strong style={{ color: '#1B3A2D' }}>{prenomTech} {nomTech}</strong> prendra en charge votre audit le{' '}
        <strong style={{ color: '#1B3A2D' }}>{dateFormatted}</strong>.
        Il se présentera à <strong style={{ color: '#1B3A2D' }}>{adresse}</strong>.
      </Text>

      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', paddingBottom: '12px' }} colSpan={2}>
              VOTRE RENDEZ-VOUS
            </td>
          </tr>
          {[
            ['Établissement', nomEtablissement],
            ['Adresse',       adresse],
            ['Date & heure',  dateFormatted],
            ['Technicien',    `${prenomTech} ${nomTech}`],
            ['Contact direct',telephoneTech],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6B7280', padding: '6px 0', fontSize: '14px', width: '40%' }}>{k}</td>
              <td style={{ color: '#1B3A2D', fontWeight: 'bold', fontSize: '14px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Text style={{ color: '#1A1A1A', fontSize: '14px', margin: '0 0 20px' }}>
        Des questions ? Contactez-nous directement :{' '}
        <a href="mailto:lucas@agencenikita.com" style={{ color: '#F26522' }}>lucas@agencenikita.com</a>
        {telephoneTech && (
          <> ou appelez directement {prenomTech} au <strong>{telephoneTech}</strong>.</>
        )}
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
