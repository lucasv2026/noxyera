'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function AdminOnboardingPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  useEffect(() => {
    // Confirm that user has a valid session from invite link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session, maybe the hash wasn't processed — handled by auth callback
      }
    })
  }, [supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/admin-noxyera'), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#1A1A1A',
        border: '1px solid #333',
        padding: '48px',
        maxWidth: '440px',
        width: '90%',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F26522', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, letterSpacing: '0.1em', margin: 0, fontSize: 14 }}>NOXYERA</p>
            <p style={{ fontSize: 11, color: '#F26522', margin: 0 }}>ADMIN</p>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: '#10B981', marginBottom: 16 }} />
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
              Mot de passe défini !
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
              Redirection vers l&apos;interface admin...
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
              Choisissez votre mot de passe
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 28px' }}>
              Bienvenue dans l&apos;équipe Noxyera. Définissez votre mot de passe pour accéder à l&apos;interface d&apos;administration.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  minLength={8}
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    background: '#0A0A0A', border: '1px solid #333',
                    color: 'white', borderRadius: 4, fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  background: '#0A0A0A', border: '1px solid #333',
                  color: 'white', borderRadius: 4, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />

              {error && (
                <p style={{ fontSize: 13, color: '#F87171', margin: 0 }}>✗ {error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#444' : '#F26522',
                  color: 'white', border: 'none', borderRadius: 4,
                  fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4,
                }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loading ? 'Enregistrement...' : 'Définir mon mot de passe →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
