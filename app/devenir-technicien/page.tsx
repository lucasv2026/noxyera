'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Smartphone, Wrench, Users, Euro, Shield, TrendingUp, CheckCircle, UserPlus } from 'lucide-react'
import { MegaMenu } from '@/components/MegaMenu'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  padding: '12px 16px',
  color: 'white',
  fontSize: 15,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: 13,
  marginBottom: 6,
  display: 'block',
}

type FormData = {
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  code_postal: string
  experience: string
  certifications: string[]
  vehicule: boolean
  disponibilite: string
  motivation: string
}

const initialForm: FormData = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  ville: '',
  code_postal: '',
  experience: '0-1an',
  certifications: [],
  vehicule: true,
  disponibilite: 'temps-plein',
  motivation: '',
}

export default function DevenirTechnicienPage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({
        ...prev,
        certifications: checked
          ? [...prev.certifications, value]
          : prev.certifications.filter(c => c !== value),
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/candidature-technicien', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Une erreur est survenue.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <MegaMenu />

      {/* ── Section 1 — Hero ── */}
      <section style={{ background: '#1B3A2D', padding: '80px 24px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#F5F0E8', color: '#1B3A2D', borderRadius: 20,
            padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            🌿 Rejoignez notre réseau
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, color: 'white', lineHeight: 1.1, margin: '0 0 24px' }}>
            Devenez technicien<br />
            <span style={{ color: '#F26522' }}>Noxyera</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 48px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Interventions régulières, outils fournis, autonomie totale. Rejoignez les 47 techniciens qui font confiance à Noxyera.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { value: '47', label: 'Techniciens actifs' },
              { value: '4.8/5', label: 'Note moyenne clients' },
              { value: '3-5j', label: 'Délai première mission' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'white', borderRadius: 12, padding: '20px 28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: 130,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1B3A2D' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('candidature-form')}
              style={{
                background: '#F26522', color: 'white', border: 'none', borderRadius: 10,
                padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Postuler maintenant
            </button>
            <button
              onClick={() => scrollTo('comment-ca-marche')}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}
            >
              En savoir plus ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── Section 2 — Comment ça marche ── */}
      <section id="comment-ca-marche" style={{ background: '#F5F0E8', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#1B3A2D', textAlign: 'center', marginBottom: 56 }}>
            Comment ça marche ?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              {
                num: 1,
                title: 'Candidature en ligne',
                desc: 'Remplissez le formulaire en 3 minutes. Pas de CV, pas de lettre.',
              },
              {
                num: 2,
                title: 'Entretien téléphonique',
                desc: 'Un responsable vous rappelle sous 48h pour vérifier votre profil.',
              },
              {
                num: 3,
                title: 'Formation Noxyera',
                desc: '2 jours de formation offerts : protocoles, outils, applications.',
              },
              {
                num: 4,
                title: 'Premières missions',
                desc: 'Vous recevez vos premières interventions sous 3 à 5 jours.',
              },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: '#1B3A2D',
                  color: 'white', fontSize: 22, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1B3A2D', margin: '0 0 8px' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3 — Ce qu'on vous fournit ── */}
      <section id="avantages" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#1B3A2D', textAlign: 'center', marginBottom: 56 }}>
            Ce qu&apos;on vous fournit
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { Icon: Smartphone, title: 'Application mobile', desc: 'Tournées optimisées, rapports en 1 clic, historique client complet.' },
              { Icon: Wrench, title: 'Équipement professionnel', desc: 'Kit de démarrage fourni : produits homologués, EPI, matériel de détection.' },
              { Icon: Users, title: 'Clients récurrents', desc: 'Contrats annuels HACCP = revenus stables et prévisibles.' },
              { Icon: Euro, title: 'Facturation simplifiée', desc: 'On gère tout : facturation, relances, encaissements. Vous touchez 70%.' },
              { Icon: Shield, title: 'Assurance RC Pro', desc: 'Couverture RC Pro incluse pour toutes vos interventions Noxyera.' },
              { Icon: TrendingUp, title: 'Évolution possible', desc: 'Les meilleurs techniciens peuvent devenir responsables secteur.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{
                border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 44, height: 44, background: '#F5F0E8', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} style={{ color: '#1B3A2D' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1B3A2D', margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — Profil recherché ── */}
      <section id="profil" style={{ background: '#F9F7F4', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#1B3A2D', textAlign: 'center', marginBottom: 48 }}>
            Le profil que nous recherchons
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 32 }}>
            {/* Indispensable */}
            <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1B3A2D', margin: '0 0 20px' }}>Indispensable</h3>
              {[
                'Permis B + véhicule',
                'Sérieux et ponctuel',
                'À l\'aise avec smartphone',
                'Capacité à travailler seul',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ color: '#22C55E', fontSize: 18, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 15, color: '#1A1A1A' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Un plus */}
            <div style={{ background: 'white', borderRadius: 12, padding: '28px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1B3A2D', margin: '0 0 20px' }}>Un plus</h3>
              {[
                'Certiphyto ou HACCP',
                'Expérience restauration/industrie',
                'Bilingue (FR/EN)',
                'Réseau pro dans le secteur',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ color: '#F26522', fontSize: 18 }}>★</span>
                  <span style={{ fontSize: 15, color: '#1A1A1A' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 15, fontStyle: 'italic', color: '#6B7280' }}>
            Débutants acceptés — formation complète assurée par Noxyera
          </p>
        </div>
      </section>

      {/* ── Section 5 — Formulaire de candidature ── */}
      <section id="candidature-form" style={{ background: '#1B3A2D', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'white', textAlign: 'center', margin: '0 0 12px' }}>
            Postulez en 3 minutes
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>
            Pas de CV. Pas de lettre de motivation obligatoire. Juste l&apos;essentiel.
          </p>

          {submitted ? (
            <div style={{
              background: 'white', borderRadius: 16, padding: '48px 32px', textAlign: 'center',
            }}>
              <CheckCircle size={64} style={{ color: '#22C55E', marginBottom: 20 }} />
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1B3A2D', margin: '0 0 12px' }}>
                Candidature envoyée !
              </h2>
              <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 32 }}>
                Nous vous recontactons sous 48h.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block', background: '#F26522', color: 'white',
                  borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Row 1: Prénom + Nom */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Jean"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    placeholder="Dupont"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 2: Email + Téléphone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jean@example.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input
                    name="telephone"
                    type="tel"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    placeholder="06 12 34 56 78"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 3: Ville + Code postal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Ville *</label>
                  <input
                    name="ville"
                    value={form.ville}
                    onChange={handleChange}
                    required
                    placeholder="Paris"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Code postal *</label>
                  <input
                    name="code_postal"
                    value={form.code_postal}
                    onChange={handleChange}
                    required
                    placeholder="75001"
                    maxLength={5}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 4: Expérience */}
              <div>
                <label style={labelStyle}>Expérience en désinsectisation *</label>
                <select
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="0-1an">0 à 1 an</option>
                  <option value="1-3ans">1 à 3 ans</option>
                  <option value="3-5ans">3 à 5 ans</option>
                  <option value="5ans+">5 ans et plus</option>
                </select>
              </div>

              {/* Row 5: Certifications */}
              <div>
                <label style={labelStyle}>Certifications</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  {[
                    { value: 'certiphyto', label: 'Certiphyto' },
                    { value: 'haccp', label: 'HACCP' },
                    { value: 'biocides', label: 'Biocides' },
                    { value: 'autre', label: 'Autre' },
                  ].map(cert => (
                    <label key={cert.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        name="certifications"
                        value={cert.value}
                        checked={form.certifications.includes(cert.value)}
                        onChange={handleChange}
                        style={{ accentColor: '#F26522', width: 16, height: 16 }}
                      />
                      {cert.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 6: Véhicule */}
              <div>
                <label style={labelStyle}>Véhicule personnel *</label>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { value: true, label: 'Oui, j\'ai un véhicule' },
                    { value: false, label: 'Non' },
                  ].map(opt => (
                    <label key={String(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                      <input
                        type="radio"
                        name="vehicule"
                        value={String(opt.value)}
                        checked={form.vehicule === opt.value}
                        onChange={() => setForm(prev => ({ ...prev, vehicule: opt.value }))}
                        style={{ accentColor: '#F26522', width: 16, height: 16 }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 7: Disponibilité */}
              <div>
                <label style={labelStyle}>Disponibilité *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { value: 'temps-plein', label: 'Temps plein' },
                    { value: 'temps-partiel', label: 'Temps partiel' },
                    { value: 'week-ends', label: 'Week-ends' },
                    { value: 'flexible', label: 'Flexible' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, disponibilite: opt.value }))}
                      style={{
                        padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 500,
                        cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                        background: form.disponibilite === opt.value ? '#F26522' : 'rgba(255,255,255,0.12)',
                        color: form.disponibilite === opt.value ? 'white' : 'rgba(255,255,255,0.75)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 8: Motivation */}
              <div>
                <label style={labelStyle}>Motivation (optionnel)</label>
                <textarea
                  name="motivation"
                  value={form.motivation}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Pourquoi souhaitez-vous rejoindre Noxyera ? (optionnel)"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '12px 16px', color: '#FCA5A5', fontSize: 14 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(242,101,34,0.6)' : '#F26522',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '16px', fontSize: 16, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%', transition: 'background 0.15s',
                }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma candidature'}
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          #candidature-form form > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        input::placeholder, textarea::placeholder {
          color: rgba(255,255,255,0.35);
        }
        select option {
          background: #1B3A2D;
          color: white;
        }
      `}</style>
    </>
  )
}
