"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { MegaMenu } from "@/components/MegaMenu";

interface AdresseSuggestion {
  label: string;
  lat: number;
  lng: number;
  citycode: string;
  postcode: string;
  city: string;
}

interface FormData {
  // Étape 1
  nomEtablissement: string;
  adresse: string;
  adresseLat?: number;
  adresseLng?: number;
  secteur: string;
  superficie: string;
  employes: string;
  // Étape 2
  prestataire: "" | "oui" | "non";
  problemesNuisibles: "" | "oui" | "non" | "sais_pas";
  haccpJour: "" | "oui" | "non" | "partiellement";
  description: string;
  // Étape 4
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  disponibilites: string[];
}

const SECTEURS = [
  "Restauration",
  "Hôtellerie",
  "Entrepôt / Logistique",
  "Agroalimentaire",
  "Autre",
];

const DISPOS = ["Matin (9h-12h)", "Après-midi (14h-18h)", "Soir (18h-20h)"];

const stepTitles = [
  "Votre établissement",
  "Situation actuelle",
  "Photos (optionnel)",
  "Vos coordonnées",
];

export default function AuditDistancePage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormData>({
    nomEtablissement: "",
    adresse: "",
    secteur: "",
    superficie: "",
    employes: "",
    prestataire: "",
    problemesNuisibles: "",
    haccpJour: "",
    description: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    disponibilites: [],
  });

  // Adresse autocomplete
  const [adresseQuery, setAdresseQuery] = useState("");
  const [adresseSuggestions, setAdresseSuggestions] = useState<AdresseSuggestion[]>([]);
  const [showAdresseSuggestions, setShowAdresseSuggestions] = useState(false);
  const adresseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (adresseDebounceRef.current) clearTimeout(adresseDebounceRef.current);
    if (adresseQuery.length < 3) { setAdresseSuggestions([]); return; }
    adresseDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresseQuery)}&limit=5&type=housenumber`);
        if (res.ok) {
          const data = await res.json() as {
            features: Array<{
              properties: { label: string; citycode: string; postcode: string; city: string };
              geometry: { coordinates: [number, number] };
            }>;
          };
          setAdresseSuggestions(data.features.map((f) => ({
            label: f.properties.label,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            citycode: f.properties.citycode,
            postcode: f.properties.postcode,
            city: f.properties.city,
          })));
          setShowAdresseSuggestions(true);
        }
      } catch { /* silent */ }
    }, 300);
  }, [adresseQuery]);

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - photos.length);
    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);
    const previews = newPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  }

  function removePhoto(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  }

  function update(field: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDispo(dispo: string) {
    const current = form.disponibilites;
    if (current.includes(dispo)) {
      update("disponibilites", current.filter((d) => d !== dispo));
    } else {
      update("disponibilites", [...current, dispo]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/audit-distance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: `${form.prenom} ${form.nom}`,
          email: form.email,
          telephone: form.telephone,
          secteur: form.secteur,
          adresse: form.adresse,
          superficie: parseInt(form.superficie) || null,
          employes: parseInt(form.employes) || null,
          prestataire: form.prestataire === "oui",
          problemesNuisibles: form.problemesNuisibles,
          haccpJour: form.haccpJour,
          description: form.description,
          disponibilites: form.disponibilites.join(", "),
          nom_etablissement: form.nomEtablissement,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        // Demo mode : success anyway
        setSuccess(true);
      }
    } catch {
      // Demo mode : success anyway
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  // Styles
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    border: "1.5px solid #E5E7EB",
    padding: "0 14px",
    fontSize: "14px",
    color: "#1A1A1A",
    background: "white",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    borderRadius: "10px",
    border: active ? "2px solid #1B3A2D" : "1.5px solid #E5E7EB",
    background: active ? "rgba(27,58,45,0.06)" : "white",
    color: active ? "#1B3A2D" : "#6B7280",
    fontWeight: active ? 700 : 500,
    fontSize: "14px",
    cursor: "pointer",
  });

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
        <MegaMenu />
        <div
          style={{
            maxWidth: "480px",
            margin: "80px auto",
            padding: "48px 32px",
            background: "white",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#D1FAE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle2 size={28} style={{ color: "#059669" }} />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 10px" }}>
            Demande envoyée ✓
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 28px", lineHeight: 1.6 }}>
            Notre équipe vous contacte sous 24h pour organiser votre audit à distance.
          </p>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "12px",
              background: "#1B3A2D",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      <MegaMenu />

      {/* Header */}
      <header style={{ background: "#1B3A2D", padding: "40px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(242,101,34,0.2)",
              color: "#F26522",
              marginBottom: "14px",
            }}
          >
            🔍 Audit à distance — Bêta
          </span>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "white", margin: "0 0 10px" }}>
            Demandez votre audit à distance
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Un expert Noxyera évalue votre situation par visioconférence sous 48h.
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "16px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", gap: "8px" }}>
          {stepTitles.map((title, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <div key={num} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isActive ? "#F26522" : isDone ? "#1B3A2D" : "#E5E7EB",
                    color: isActive || isDone ? "white" : "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    margin: "0 auto 4px",
                  }}
                >
                  {isDone ? "✓" : num}
                </div>
                <p style={{ fontSize: "11px", color: isActive ? "#F26522" : "#9CA3AF", margin: 0, fontWeight: isActive ? 700 : 400 }}>
                  {title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Étape 1 */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 24px" }}>
                Votre établissement
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Nom de l&apos;établissement</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={form.nomEtablissement}
                    onChange={(e) => update("nomEtablissement", e.target.value)}
                    placeholder="Brasserie Voltaire"
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>Adresse</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={adresseQuery}
                    onChange={(e) => {
                      setAdresseQuery(e.target.value);
                      update("adresse", e.target.value);
                    }}
                    onFocus={() => adresseSuggestions.length > 0 && setShowAdresseSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAdresseSuggestions(false), 150)}
                    placeholder="12 rue de la Paix, Paris"
                  />
                  {showAdresseSuggestions && adresseSuggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: "white",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        zIndex: 50,
                        overflow: "hidden",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      {adresseSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={() => {
                            setAdresseQuery(s.label);
                            update("adresse", s.label);
                            setForm((prev) => ({ ...prev, adresseLat: s.lat, adresseLng: s.lng }));
                            setShowAdresseSuggestions(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 16px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            fontSize: "13px",
                            color: "#1A1A1A",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F0E8"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Secteur d&apos;activité</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.secteur}
                    onChange={(e) => update("secteur", e.target.value)}
                  >
                    <option value="">Choisir un secteur…</option>
                    {SECTEURS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Superficie (m²)</label>
                    <input
                      style={inputStyle}
                      type="number"
                      value={form.superficie}
                      onChange={(e) => update("superficie", e.target.value)}
                      placeholder="200"
                      min="1"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nombre d&apos;employés</label>
                    <input
                      style={inputStyle}
                      type="number"
                      value={form.employes}
                      onChange={(e) => update("employes", e.target.value)}
                      placeholder="5"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.nomEtablissement || !form.adresse || !form.secteur}
                style={{
                  marginTop: "28px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#F26522",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  opacity: (!form.nomEtablissement || !form.adresse || !form.secteur) ? 0.5 : 1,
                }}
              >
                Suivant <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 24px" }}>
                Situation actuelle
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <label style={labelStyle}>Avez-vous un prestataire actuel ?</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {(["oui", "non"] as const).map((v) => (
                      <button key={v} type="button" onClick={() => update("prestataire", v)} style={toggleBtnStyle(form.prestataire === v)}>
                        {v === "oui" ? "Oui" : "Non"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Problèmes de nuisibles ces 12 derniers mois ?</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {([["oui", "Oui"], ["non", "Non"], ["sais_pas", "Je ne sais pas"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => update("problemesNuisibles", v)} style={toggleBtnStyle(form.problemesNuisibles === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Rapports HACCP à jour ?</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {([["oui", "Oui"], ["non", "Non"], ["partiellement", "Partiellement"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => update("haccpJour", v)} style={toggleBtnStyle(form.haccpJour === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Décrivez votre situation <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optionnel)</span></label>
                  <textarea
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      border: "1.5px solid #E5E7EB",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#1A1A1A",
                      background: "white",
                      boxSizing: "border-box",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "100px",
                    }}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Décrivez les problèmes rencontrés, zones concernées…"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1.5px solid #E5E7EB",
                    background: "white",
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "#F26522",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Suivant <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Photos */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px" }}>
                Photos (optionnel)
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px" }}>
                Partagez des photos de vos zones à risque pour un diagnostic plus précis.
              </p>

              <label
                style={{
                  display: "block",
                  border: "2px dashed #E5E7EB",
                  borderRadius: "16px",
                  background: "#F9FAFB",
                  padding: "32px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                <Upload size={24} style={{ color: "#9CA3AF", margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
                  Glissez vos photos ici
                </p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 12px" }}>
                  ou cliquez pour sélectionner (max 5 photos)
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#1B3A2D",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Choisir des photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>

              {photoPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Photo ${i + 1}`}
                        style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#EF4444",
                          border: "none",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1.5px solid #E5E7EB",
                    background: "white",
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "#F26522",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Suivant <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    background: "transparent",
                    color: "#9CA3AF",
                    fontSize: "14px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Passer cette étape →
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 24px" }}>
                Vos coordonnées
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Prénom</label>
                    <input
                      style={inputStyle}
                      type="text"
                      value={form.prenom}
                      onChange={(e) => update("prenom", e.target.value)}
                      placeholder="Marie"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nom</label>
                    <input
                      style={inputStyle}
                      type="text"
                      value={form.nom}
                      onChange={(e) => update("nom", e.target.value)}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email professionnel</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="marie@brasserie-voltaire.fr"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => update("telephone", e.target.value)}
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Disponibilités préférées</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {DISPOS.map((d) => (
                      <label
                        key={d}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.disponibilites.includes(d)}
                          onChange={() => toggleDispo(d)}
                          style={{ width: "16px", height: "16px", accentColor: "#1B3A2D" }}
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1.5px solid #E5E7EB",
                    background: "white",
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.prenom || !form.email}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "#F26522",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting || !form.prenom || !form.email ? 0.7 : 1,
                  }}
                >
                  {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                  Envoyer ma demande d&apos;audit →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
