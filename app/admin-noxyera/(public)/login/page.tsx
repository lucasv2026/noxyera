'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Try Supabase auth first
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      )

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (!authError && data.user) {
        // Check admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (profile?.role === 'admin') {
          router.push('/admin-noxyera')
          return
        } else {
          await supabase.auth.signOut()
          setError('Accès non autorisé')
          setLoading(false)
          return
        }
      }
    } catch {
      // Supabase unavailable, fall through to cookie auth
    }

    // Fall back to cookie auth
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/admin-noxyera')
    } else {
      setError('Identifiants incorrects')
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{
        background: '#1A1A1A',
        border: '1px solid #333',
        padding: '48px',
        maxWidth: '420px',
        width: '90%',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
            NOXYERA · INTERNAL
          </div>
          <h1 style={{ color: '#FFF', fontSize: '24px', margin: 0, fontWeight: 500, fontFamily: 'monospace' }}>
            Administration
          </h1>
          <div style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
            Accès restreint aux opérateurs Noxyera.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email opérateur"
            autoFocus
            required
            style={{
              width: '100%', padding: '12px 16px', background: '#0A0A0A',
              border: '1px solid #333', color: '#FFF', fontFamily: 'monospace',
              marginBottom: '12px', borderRadius: '2px', fontSize: '14px',
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
              width: '100%', padding: '12px 16px', background: '#0A0A0A',
              border: '1px solid #333', color: '#FFF', fontFamily: 'monospace',
              marginBottom: '20px', borderRadius: '2px', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#F87171', fontSize: '13px', marginBottom: '16px', fontFamily: 'monospace' }}>
              ✗ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '14px', background: loading ? '#444' : '#FFF',
              color: '#000', border: 'none', fontFamily: 'monospace', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '2px',
              fontSize: '14px', letterSpacing: '1px',
            }}
          >
            {loading ? 'VÉRIFICATION...' : 'AUTHENTIFIER →'}
          </button>
        </form>
      </div>
    </div>
  )
}
