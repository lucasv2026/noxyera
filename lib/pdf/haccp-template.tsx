import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

export interface HaccpPdfProps {
  id: string
  siteNom: string
  adresse: string
  technicienNom: string
  technicienCertif: string
  dateIntervention: string
  type: 'preventif' | 'curatif' | 'urgence'
  zonesTraitees: string[]
  produitsUtilises: string[]
  notes: string
  haccpConforme: boolean
  numeroRapport: string
}

const PRIMARY = '#1B3A2D'
const ACCENT = '#F26522'
const LIGHT_GREEN = '#E8F0EB'
const LIGHT_GRAY = '#F5F5F5'
const BORDER_COLOR = '#D0D9D4'
const WHITE = '#FFFFFF'
const RED = '#C0392B'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333333',
    paddingBottom: 60,
  },
  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerLogo: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#A8C5B5',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerDate: {
    fontSize: 9,
    color: '#A8C5B5',
  },
  headerNumero: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginTop: 3,
  },
  // Orange accent bar
  accentBar: {
    height: 3,
    backgroundColor: ACCENT,
  },
  // Body
  body: {
    paddingHorizontal: 28,
    paddingTop: 18,
  },
  // Section
  sectionWrapper: {
    marginBottom: 14,
  },
  sectionHeader: {
    backgroundColor: PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Two-column row layout
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldBlock: {
    flex: 1,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 9.5,
    color: '#1A1A1A',
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 3,
  },
  // Zones grid
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  zoneItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  zoneCheck: {
    width: 14,
    height: 14,
    backgroundColor: '#2ECC71',
    borderRadius: 2,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneCheckText: {
    color: WHITE,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  zoneText: {
    fontSize: 9,
    color: '#333333',
  },
  // Products list
  productItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 6,
  },
  productBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ACCENT,
    marginRight: 8,
    marginTop: 3,
  },
  productText: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
  },
  // Observations
  observationsBox: {
    backgroundColor: LIGHT_GRAY,
    borderWidth: 0.5,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    padding: 10,
    minHeight: 50,
  },
  observationsText: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.5,
  },
  // HACCP Badge
  haccpBadgeWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  haccpBadge: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 4,
    alignItems: 'center',
  },
  haccpBadgeConforme: {
    backgroundColor: '#27AE60',
  },
  haccpBadgeNonConforme: {
    backgroundColor: RED,
  },
  haccpBadgeText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 2,
  },
  haccpBadgeSubtext: {
    fontSize: 8,
    color: WHITE,
    marginTop: 3,
    opacity: 0.85,
  },
  // Type badge inline
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  // Table style for tech info
  table: {
    borderWidth: 0.5,
    borderColor: BORDER_COLOR,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCellLabel: {
    width: '35%',
    backgroundColor: LIGHT_GREEN,
    padding: 6,
    fontSize: 8,
    color: PRIMARY,
    fontFamily: 'Helvetica-Bold',
  },
  tableCellValue: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    color: '#1A1A1A',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6.5,
    color: '#A8C5B5',
  },
  footerPage: {
    fontSize: 7,
    color: WHITE,
  },
  // Divider
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: BORDER_COLOR,
    marginVertical: 10,
  },
})

function getTypeLabel(type: HaccpPdfProps['type']): string {
  switch (type) {
    case 'preventif': return 'Préventif'
    case 'curatif': return 'Curatif'
    case 'urgence': return 'Urgence'
    default: return type
  }
}

function getTypeColor(type: HaccpPdfProps['type']): string {
  switch (type) {
    case 'preventif': return '#27AE60'
    case 'curatif': return '#E67E22'
    case 'urgence': return '#C0392B'
    default: return PRIMARY
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export function HaccpPdfDocument(props: HaccpPdfProps): React.ReactElement {
  const {
    siteNom,
    adresse,
    technicienNom,
    technicienCertif,
    dateIntervention,
    type,
    zonesTraitees,
    produitsUtilises,
    notes,
    haccpConforme,
    numeroRapport,
  } = props

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const verificationUrl = `https://noxyera.fr/verification/${numeroRapport}`

  // Split zones into pairs for 2-column grid
  const zoneRows: string[][] = []
  for (let i = 0; i < zonesTraitees.length; i += 2) {
    zoneRows.push(zonesTraitees.slice(i, i + 2))
  }

  return (
    <Document
      title={`Rapport HACCP — ${numeroRapport}`}
      author="Noxyera"
      subject="Rapport d'intervention HACCP"
      creator="Noxyera SaaS"
    >
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLogo}>NOXYERA</Text>
            <Text style={styles.headerSubtitle}>Rapport d&apos;intervention HACCP</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>Émis le {today}</Text>
            <Text style={styles.headerNumero}>{numeroRapport}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* Section Établissement */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Établissement</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Nom de l&apos;établissement</Text>
                <Text style={styles.fieldValue}>{siteNom}</Text>
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Type d&apos;intervention</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: BORDER_COLOR }}>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(type) }]}>
                    <Text style={styles.typeBadgeText}>{getTypeLabel(type)}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Adresse</Text>
                <Text style={styles.fieldValue}>{adresse}</Text>
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Date d&apos;intervention</Text>
                <Text style={styles.fieldValue}>{formatDate(dateIntervention)}</Text>
              </View>
            </View>
          </View>

          {/* Section Technicien */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Technicien</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>Nom du technicien</Text>
                <Text style={styles.tableCellValue}>{technicienNom}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>N° Certibiocide</Text>
                <Text style={styles.tableCellValue}>{technicienCertif}</Text>
              </View>
              <View style={styles.tableRowLast}>
                <Text style={styles.tableCellLabel}>Date / Heure</Text>
                <Text style={styles.tableCellValue}>{formatDateTime(dateIntervention)}</Text>
              </View>
            </View>
          </View>

          {/* Section Zones traitées */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Zones traitées</Text>
            </View>
            {zonesTraitees.length === 0 ? (
              <Text style={{ fontSize: 9, color: '#999', paddingLeft: 6 }}>Aucune zone renseignée</Text>
            ) : (
              <View style={[styles.zonesGrid, { borderWidth: 0.5, borderColor: BORDER_COLOR, borderRadius: 3 }]}>
                {zonesTraitees.map((zone, idx) => (
                  <View key={idx} style={[styles.zoneItem, { borderRightWidth: idx % 2 === 0 ? 0.5 : 0, borderRightColor: BORDER_COLOR, borderBottomWidth: idx < zonesTraitees.length - 2 || (zonesTraitees.length % 2 === 1 && idx === zonesTraitees.length - 1) ? 0.5 : 0, borderBottomColor: BORDER_COLOR }]}>
                    <View style={styles.zoneCheck}>
                      <Text style={styles.zoneCheckText}>✓</Text>
                    </View>
                    <Text style={styles.zoneText}>{zone}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Section Produits utilisés */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Produits biocides utilisés</Text>
            </View>
            {produitsUtilises.length === 0 ? (
              <Text style={{ fontSize: 9, color: '#999', paddingLeft: 6 }}>Aucun produit renseigné</Text>
            ) : (
              <View style={[{ borderWidth: 0.5, borderColor: BORDER_COLOR, borderRadius: 3, paddingVertical: 6, paddingHorizontal: 4 }]}>
                {produitsUtilises.map((produit, idx) => (
                  <View key={idx} style={styles.productItem}>
                    <View style={styles.productBullet} />
                    <Text style={styles.productText}>{produit}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Section Observations */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Observations & Recommandations</Text>
            </View>
            <View style={styles.observationsBox}>
              <Text style={styles.observationsText}>
                {notes || 'Aucune observation particulière.'}
              </Text>
            </View>
          </View>

          {/* Section Conformité HACCP */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Conformité HACCP</Text>
            </View>
            <View style={styles.haccpBadgeWrapper}>
              <View style={[styles.haccpBadge, haccpConforme ? styles.haccpBadgeConforme : styles.haccpBadgeNonConforme]}>
                <Text style={styles.haccpBadgeText}>
                  {haccpConforme ? '✓  CONFORME' : '✗  NON CONFORME'}
                </Text>
                <Text style={styles.haccpBadgeSubtext}>
                  {haccpConforme
                    ? 'L\'établissement satisfait aux exigences HACCP'
                    : 'Des mesures correctives sont requises'}
                </Text>
              </View>
            </View>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Rapport conforme au Plan de Maîtrise Sanitaire (PMS) — Paquet Hygiène EU 852/2004 — HACCP{'\n'}
            Vérification : {verificationUrl}
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
