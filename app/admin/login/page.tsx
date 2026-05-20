'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'

export default function AdminLoginPage() {
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
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Mot de passe incorrect')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Logo dark />
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '8px' }}>Accès administration</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
              background: '#161B22', border: '1px solid #30363D', color: 'white',
              outline: 'none', boxSizing: 'border-box', marginBottom: '12px'
            }}
          />
          {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px',
              fontWeight: 600, background: loading ? '#374151' : '#F26522',
              color: 'white', border: 'none', cursor: 'pointer',
            }}
          >
            {loading ? 'Vérification...' : 'Accéder →'}
          </button>
        </form>
      </div>
    </div>
  )
}
