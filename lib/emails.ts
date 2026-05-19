const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Noxyera <bonjour@noxyera.fr>'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('[Email mock]', subject, 'to', to)
    return { success: true, mock: true }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  const data = await res.json()
  return data
}

// Email 1 — Bienvenue
export async function sendWelcomeEmail(to: string, nom: string, loginUrl: string) {
  return sendEmail(to, `Bienvenue chez Noxyera — votre espace est prêt`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B3A2D;padding:32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">Noxyera</h1>
      </div>
      <div style="padding:32px;background:white;border:1px solid #E5E7EB;">
        <p style="font-size:16px;color:#1A1A1A;">Bonjour ${nom},</p>
        <p style="color:#6B7280;">Votre espace Noxyera est prêt. Accédez à votre tableau de bord pour suivre vos interventions HACCP en temps réel.</p>
        <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#F26522;color:white;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Accéder à mon espace →</a>
        <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Noxyera — Conformité HACCP sans effort</p>
      </div>
    </div>
  `)
}

// Email 2 — Rapport disponible
export async function sendRapportEmail(to: string, nomSite: string, pdfUrl: string, technicienNom: string, dateIntervention: string) {
  return sendEmail(to, `Votre rapport HACCP est disponible — ${nomSite}`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B3A2D;padding:32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">Noxyera</h1>
      </div>
      <div style="padding:32px;background:white;border:1px solid #E5E7EB;">
        <p style="font-size:16px;color:#1A1A1A;font-weight:700;">Votre rapport HACCP est disponible</p>
        <p style="color:#6B7280;">L'intervention du <strong>${dateIntervention}</strong> par <strong>${technicienNom}</strong> chez <strong>${nomSite}</strong> est terminée.</p>
        <a href="${pdfUrl}" style="display:inline-block;padding:12px 24px;background:#1B3A2D;color:white;text-decoration:none;border-radius:10px;font-weight:600;margin:16px 0;">Télécharger le rapport PDF →</a>
        <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Ce rapport est certifié conforme HACCP et signé électroniquement par le technicien.</p>
      </div>
    </div>
  `)
}

// Email 3 — Rappel intervention J-3
export async function sendRappelInterventionEmail(to: string, nomSite: string, date: string, technicien: string, certibiocide: string) {
  return sendEmail(to, `Rappel — Intervention Noxyera le ${date} chez ${nomSite}`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B3A2D;padding:32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">Noxyera</h1>
      </div>
      <div style="padding:32px;background:white;border:1px solid #E5E7EB;">
        <p style="font-size:16px;color:#1A1A1A;font-weight:700;">Rappel d&apos;intervention dans 3 jours</p>
        <div style="background:#F5F0E8;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#1A1A1A;"><strong>Site :</strong> ${nomSite}</p>
          <p style="margin:0 0 8px;color:#1A1A1A;"><strong>Date :</strong> ${date}</p>
          <p style="margin:0 0 8px;color:#1A1A1A;"><strong>Technicien :</strong> ${technicien}</p>
          <p style="margin:0;color:#1A1A1A;"><strong>N° Certibiocide :</strong> ${certibiocide}</p>
        </div>
        <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Pour toute urgence : 01 23 45 67 89</p>
      </div>
    </div>
  `)
}

// Email 4 — Nouvel audit à distance (notification interne)
export async function sendAuditNotificationEmail(lead: {
  nom?: string; email: string; telephone?: string; secteur?: string;
  adresse?: string; superficie_m2?: number; situation_actuelle?: unknown; disponibilites?: string
}) {
  return sendEmail('lucas@agencenikita.com', `Nouvel audit à distance — ${lead.nom || lead.email}`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B3A2D;padding:32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">Noxyera — Nouvel audit</h1>
      </div>
      <div style="padding:32px;background:white;border:1px solid #E5E7EB;">
        <p style="font-size:16px;font-weight:700;color:#1A1A1A;">Nouveau lead audit à distance</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6B7280;">Nom</td><td style="padding:8px 0;color:#1A1A1A;font-weight:600;">${lead.nom || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;color:#1A1A1A;">${lead.email}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Téléphone</td><td style="padding:8px 0;color:#1A1A1A;">${lead.telephone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Secteur</td><td style="padding:8px 0;color:#1A1A1A;">${lead.secteur || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Adresse</td><td style="padding:8px 0;color:#1A1A1A;">${lead.adresse || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Superficie</td><td style="padding:8px 0;color:#1A1A1A;">${lead.superficie_m2 || '—'} m²</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Disponibilités</td><td style="padding:8px 0;color:#1A1A1A;">${lead.disponibilites || '—'}</td></tr>
        </table>
        ${lead.situation_actuelle ? `<div style="background:#FFF7ED;border-radius:8px;padding:12px;margin-top:16px;"><pre style="margin:0;font-size:12px;">${JSON.stringify(lead.situation_actuelle, null, 2)}</pre></div>` : ''}
      </div>
    </div>
  `)
}
