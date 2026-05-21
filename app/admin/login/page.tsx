'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Identifiants incorrects')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1B3A2D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'white', fontWeight: 800, fontSize: '22px', letterSpacing: '4px', margin: '0 0 6px' }}>NOXYERA</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Administration</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>Accéder à l&apos;administration</h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
                background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1A1A1A',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
                background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1A1A1A',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', fontSize: '14px',
                fontWeight: 600, background: (loading || !email || !password) ? '#9CA3AF' : '#1B3A2D',
                color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
              }}
            >
              {loading ? 'Vérification...' : "Accéder à l'administration →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
