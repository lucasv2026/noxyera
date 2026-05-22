'use client'

import { useState, useEffect } from 'react'
import { UserCog, Plus, X, CheckCircle, Loader2 } from 'lucide-react'

interface AdminProfile {
  id: string
  user_id: string
  prenom: string | null
  nom: string | null
  email: string | null
  created_at: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface InviteModalProps {
  onClose: () => void
  onSuccess: (email: string) => void
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/inviter-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, prenom, nom }),
      })
      if (res.ok) {
        onSuccess(email)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Erreur lors de l\'invitation')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0D2016', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: 32, maxWidth: 440, width: '90%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>Inviter un admin</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@exemple.com"
              style={{
                width: '100%', padding: '10px 14px', background: '#0A1A11',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
              PRÉNOM
            </label>
            <input
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              required
              placeholder="Prénom"
              style={{
                width: '100%', padding: '10px 14px', background: '#0A1A11',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
              NOM
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              required
              placeholder="Nom"
              style={{
                width: '100%', padding: '10px 14px', background: '#0A1A11',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#F87171', margin: 0 }}>✗ {error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !email || !prenom || !nom}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                background: '#F26522', color: 'white', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              Envoyer l&apos;invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/admins')
      .then(r => r.json())
      .then(d => setAdmins(d.admins ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSuccess(email: string) {
    setShowModal(false)
    setToast(`Invitation envoyée à ${email}`)
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div style={{ padding: '32px', maxWidth: 900 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#10B981', color: 'white', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F26522', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCog size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Gestion des admins</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {admins.length} administrateur{admins.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#F26522', color: 'white', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          Inviter un admin
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#0D2016', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>NOM</span>
          <span>EMAIL</span>
          <span>DEPUIS</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={22} style={{ color: 'rgba(255,255,255,0.3)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : admins.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Aucun administrateur trouvé</p>
          </div>
        ) : admins.map((admin, idx) => (
          <div
            key={admin.id}
            style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr',
              padding: '16px 20px', alignItems: 'center',
              borderBottom: idx < admins.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: 0 }}>
                {[admin.prenom, admin.nom].filter(Boolean).join(' ') || '—'}
              </p>
              <span style={{
                fontSize: 10, padding: '1px 8px', borderRadius: 20,
                background: 'rgba(242,101,34,0.15)', color: '#F26522', fontWeight: 700,
              }}>
                ADMIN
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{admin.email ?? '—'}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{formatDate(admin.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
