"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Building2, Search } from "lucide-react";
import { DEMO_CLIENTS, DEMO_FACTURES } from "@/lib/demo-data";

function StatutBadge({ statut }: { statut: "conforme" | "a_planifier" | "urgent" }) {
  if (statut === "conforme") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
      <CheckCircle2 size={10} /> Conforme
    </span>
  );
  if (statut === "a_planifier") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
      <Clock size={10} /> À planifier
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "rgba(220,38,38,0.15)", color: "#DC2626" }}>
      <AlertTriangle size={10} /> Urgent
    </span>
  );
}

export default function AdminClientsPage() {
  const [search, setSearch] = useState("");

  const totalARR = DEMO_CLIENTS.reduce((acc, c) => acc + c.prixAnnuel, 0);

  const filtered = DEMO_CLIENTS.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.secteur.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {DEMO_CLIENTS.length} clients actifs · ARR total {totalARR.toLocaleString("fr-FR")} €
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#F26522" }}
        >
          + Nouveau client
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "ARR total", value: `${totalARR.toLocaleString("fr-FR")} €`, color: "#10B981" },
          { label: "Formule Sérénité", value: DEMO_CLIENTS.filter(c => c.formule === "serenite").length, color: "#60A5FA" },
          { label: "À planifier", value: DEMO_CLIENTS.filter(c => c.statut === "a_planifier").length, color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              {label}
            </p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-semibold text-sm text-white flex-1">Tous les clients</h2>
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none w-48 transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            />
          </div>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Table header */}
        <div className="hidden lg:grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)", fontFamily: "monospace" }}>
          <span className="col-span-4">Client</span>
          <span className="col-span-2">Secteur</span>
          <span className="col-span-2">Formule</span>
          <span className="col-span-2 text-right">ARR</span>
          <span className="col-span-1">HACCP</span>
          <span className="col-span-1">Statut</span>
        </div>

        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              Aucun client ne correspond à &ldquo;{search}&rdquo;
            </div>
          )}
          {filtered.map((client) => (
            <div key={client.id}
              className="flex lg:grid lg:grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer">
              {/* Client */}
              <div className="flex items-center gap-3 col-span-4 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "#1B4332", color: "#10B981" }}>
                  {client.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-white truncate">{client.nom}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {client.multiSites ? `${client.nbSites} sites` : "Site unique"}
                  </p>
                </div>
              </div>

              {/* Secteur */}
              <p className="col-span-2 text-xs hidden lg:block truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                {client.secteur}
              </p>

              {/* Formule */}
              <div className="col-span-2 hidden lg:block">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: client.formule === "serenite" ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.08)",
                    color: client.formule === "serenite" ? "#60A5FA" : "rgba(255,255,255,0.55)",
                  }}>
                  {client.formule === "serenite" ? "Sérénité" : "Essentiel"}
                </span>
              </div>

              {/* ARR */}
              <p className="col-span-2 text-right text-sm font-bold text-white hidden lg:block"
                style={{ fontFamily: "monospace" }}>
                {client.prixAnnuel.toLocaleString("fr-FR")} €
              </p>

              {/* HACCP */}
              <p className="col-span-1 text-sm font-semibold hidden lg:block"
                style={{
                  color: client.haccpScore >= 90 ? "#10B981"
                    : client.haccpScore >= 75 ? "#F59E0B" : "#DC2626"
                }}>
                {client.haccpScore}%
              </p>

              {/* Statut */}
              <div className="col-span-1">
                <StatutBadge statut={client.statut} />
              </div>

              <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} className="ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Factures récentes */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-semibold text-sm text-white">Dernières factures</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {DEMO_FACTURES.map((f) => (
            <div key={f.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{f.reference}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{f.description}</p>
              </div>
              <p className="text-sm font-bold text-white" style={{ fontFamily: "monospace" }}>
                {f.montant.toLocaleString("fr-FR")} €
              </p>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: f.statut === "payee" ? "rgba(16,185,129,0.15)"
                    : f.statut === "en_retard" ? "rgba(220,38,38,0.15)"
                    : "rgba(245,158,11,0.15)",
                  color: f.statut === "payee" ? "#10B981"
                    : f.statut === "en_retard" ? "#DC2626"
                    : "#F59E0B",
                }}
              >
                {f.statut === "payee" ? "Payée" : f.statut === "en_retard" ? "En retard" : "En attente"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
