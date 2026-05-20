import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devenir technicien | Noxyera',
  description: 'Rejoignez le réseau Noxyera. Missions régulières, outils fournis, autonomie totale. Postulez en 3 minutes.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
