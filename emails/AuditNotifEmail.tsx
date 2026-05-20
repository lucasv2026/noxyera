import * as React from 'react'
import { Heading, Text, Button } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface Props { nomEtablissement: string; adresse: string; secteur: string; nomContact: string; emailContact: string; telephone: string; situation: { prestataire: boolean; problemes: string; rapports: string }; disponibilites: string; adminUrl: string }

export function AuditNotifEmail({ nomEtablissement, adresse, secteur, nomContact, emailContact, telephone, situation, disponibilites, adminUrl }: Props) {
  return (
    <EmailLayout>
      <Heading style={{ color: '#1B3A2D', fontSize: '20px', margin: '0 0 8px' }}>🔔 Nouvel audit à distance reçu</Heading>
      <Text style={{ color: '#6B7280', margin: '0 0 24px' }}>Un établissement a demandé un audit préliminaire via le site.</Text>
      <table width="100%" style={{ backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <tbody>
          {[['Nom établissement', nomEtablissement], ['Adresse', adresse], ['Secteur', secteur], ['Contact', nomContact], ['Email', emailContact], ['Téléphone', telephone], ['Disponibilités', disponibilites], ['Prestataire actuel', situation.prestataire ? 'Oui' : 'Non'], ['Problèmes récents', situation.problemes], ['Rapports à jour', situation.rapports]].map(([l, v]) => (
            <tr key={l}><td style={{ color: '#6B7280', padding: '5px 0' }}>{l}</td><td style={{ color: '#1B3A2D', fontWeight: 'bold', textAlign: 'right' as const }}>{String(v)}</td></tr>
          ))}
        </tbody>
      </table>
      <Button href={adminUrl} style={{ backgroundColor: '#1B3A2D', color: '#FFFFFF', padding: '14px 32px', borderRadius: '8px', fontWeight: 'bold', display: 'block', textAlign: 'center' as const, textDecoration: 'none' }}>Voir dans l&apos;admin →</Button>
    </EmailLayout>
  )
}
