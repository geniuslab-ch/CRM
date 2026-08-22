import "server-only";
import * as React from "react";
import { Document, Page, View, Text, StyleSheet, Svg, Rect, Path } from "@react-pdf/renderer";
import { Sponsor, SponsorshipTier } from "@/types";

// Brand tokens mirrored from app/globals.css (hsl(84 92% 55%) etc.) — PDF
// rendering can't read CSS custom properties, so the hex equivalents are
// pinned here to keep the export visually consistent with the app.
const COLOR = {
  ink: "#12181f",
  muted: "#5b6572",
  border: "#e2e5df",
  surface: "#f4f6f1",
  primary: "#a1f623",
  primaryInk: "#1b2a12",
  accent: "#2596c4",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLOR.ink,
  },
  header: {
    backgroundColor: COLOR.ink,
    paddingHorizontal: 40,
    paddingVertical: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  wordmark: { fontFamily: "Helvetica-Bold", fontSize: 15, color: COLOR.white, letterSpacing: 0.6 },
  tagline: { fontSize: 7.5, color: "#9aa3ad", letterSpacing: 1.4, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 9, color: COLOR.primary, fontFamily: "Helvetica-Bold", letterSpacing: 1.6 },
  docDate: { fontSize: 8.5, color: "#9aa3ad", marginTop: 3 },

  body: { paddingHorizontal: 40, paddingTop: 26 },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
    paddingBottom: 16,
    marginBottom: 20,
  },
  metaLabel: { fontSize: 7.5, color: COLOR.muted, letterSpacing: 1, marginBottom: 3 },
  metaValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  metaSub: { fontSize: 9, color: COLOR.muted, marginTop: 1 },

  tierCard: {
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 6,
    padding: 18,
    marginBottom: 20,
  },
  tierName: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: COLOR.accent, letterSpacing: 1.2 },
  tierTagline: { fontSize: 9.5, color: COLOR.muted, marginTop: 3 },

  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
  },
  section: { marginBottom: 20 },

  benefitRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
  benefitText: { fontSize: 10, flex: 1, lineHeight: 1.35 },

  paragraph: { fontSize: 10, color: COLOR.ink, lineHeight: 1.5 },

  briefRow: { marginBottom: 8 },
  briefLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: COLOR.accent, letterSpacing: 0.6, marginBottom: 2, textTransform: "uppercase" },
  briefText: { fontSize: 9.5, color: COLOR.ink, lineHeight: 1.4 },

  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  stepNumber: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLOR.ink,
    color: COLOR.white,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginRight: 8,
  },
  stepText: { fontSize: 10, flex: 1, lineHeight: 1.3, paddingTop: 1 },

  closing: {
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
  },
  closingLine: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  closingSub: { fontSize: 9, color: COLOR.muted, marginTop: 3 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: COLOR.muted },
});

function LogoMark() {
  return (
    <View style={styles.headerLeft}>
      <Svg width={30} height={30} style={{ marginRight: 10 }}>
        <Rect x={0} y={0} width={30} height={30} rx={7} fill={COLOR.primary} />
        <Path d="M10 8h7c3 0 5 2 5 5s-2 5-5 5h-4v6h-3V8zm3 3v4h4c1.4 0 2.4-1 2.4-2s-1-2-2.4-2h-4z" fill={COLOR.primaryInk} />
      </Svg>
      <View>
        <Text style={styles.wordmark}>PANNA LEAGUE</Text>
        <Text style={styles.tagline}>SWITZERLAND · STREET FOOTBALL</Text>
      </View>
    </View>
  );
}

// The Researcher agent's deep-dive briefs can run to several hundred
// words per field (great for the CRM's Company information card, which
// shows them in full) — far too long for a scannable one-page pitch, so
// the PDF gets a clipped excerpt instead of the full paragraph.
function clip(text: string, max = 240): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

// Internal research fields sometimes carry a trailing "Sources: url1, url2"
// citation list (added for CRM provenance, never meant for a sponsor-facing
// document) — strip it before anything reaches the PDF, regardless of
// whether the field was written before or after that separation existed.
function stripSources(text: string): string {
  return text.replace(/\s*Sources?:\s*https?:\/\/[\s\S]*$/i, "").trim();
}

// "Why Panna League" reads as a scannable bullet list, matching the
// Benefits section, rather than dense prose — split on sentence boundaries.
function toBullets(text: string): string[] {
  return stripSources(text)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function CheckGlyph() {
  return (
    <Svg width={11} height={11} style={{ marginRight: 8, marginTop: 2 }}>
      <Rect x={0} y={0} width={11} height={11} rx={2.5} fill={COLOR.primary} />
      <Path d="M2.6 5.7l1.7 1.7 3.3-3.8" stroke={COLOR.primaryInk} strokeWidth={1.3} fill="none" />
    </Svg>
  );
}

export function ProposalDocument({ sponsor, tier }: { sponsor: Sponsor; tier: SponsorshipTier }) {
  const preparedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document
      title={`Panna League Sponsorship Proposal — ${sponsor.name}`}
      author="Panna League Switzerland"
      subject="Sponsorship proposal"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <LogoMark />
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>SPONSORSHIP PROPOSAL</Text>
            <Text style={styles.docDate}>Panna League First — Lausanne</Text>
            <Text style={styles.docDate}>{preparedDate}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>PREPARED FOR</Text>
              <Text style={styles.metaValue}>{sponsor.name}</Text>
              <Text style={styles.metaSub}>
                {sponsor.research.contactPerson.name} · {sponsor.research.contactPerson.role}
              </Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>INDUSTRY</Text>
              <Text style={styles.metaValue}>{sponsor.category}</Text>
              <Text style={styles.metaSub}>{sponsor.city}, Switzerland</Text>
            </View>
          </View>

          <View style={styles.tierCard}>
            <Text style={styles.tierName}>{tier.name.toUpperCase()}</Text>
            <Text style={styles.tierTagline}>{tier.tagline}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits included</Text>
            {tier.benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <CheckGlyph />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company brief</Text>
            <View style={styles.briefRow}>
              <Text style={styles.briefLabel}>Swiss presence</Text>
              <Text style={styles.briefText}>{clip(sponsor.research.swissPresence)}</Text>
            </View>
            <View style={styles.briefRow}>
              <Text style={styles.briefLabel}>Recent activity</Text>
              <Text style={styles.briefText}>{clip(sponsor.research.recentMarketingActivity)}</Text>
            </View>
            <View style={styles.briefRow}>
              <Text style={styles.briefLabel}>Existing sponsorships</Text>
              <Text style={styles.briefText}>{clip(sponsor.research.existingSponsorships)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Panna League</Text>
            {[...toBullets(sponsor.fitWhy), ...toBullets(sponsor.research.reasonToSponsor)].map((line, i) => (
              <View key={i} style={styles.benefitRow}>
                <CheckGlyph />
                <Text style={styles.benefitText}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next steps</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Review this proposal internally.</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Reply with questions or requested adjustments.</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Confirm to lock in your activation slot.</Text>
            </View>
          </View>

          <View style={styles.closing}>
            <Text style={styles.closingLine}>Let&apos;s talk.</Text>
            <Text style={styles.closingSub}>— Panna League Team</Text>
            <Text style={styles.closingSub}>pannaleague@mycountryisgoodat.com</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Panna League Switzerland · Sponsorship Proposal · {sponsor.name}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
