// Root layout — pass-through uniquement.
// L'auth est gérée dans app/admin-noxyera/(protected)/layout.tsx
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
