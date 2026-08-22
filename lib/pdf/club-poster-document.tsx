import "server-only";
import * as React from "react";
import { Document, Page, View, Text, StyleSheet, Svg, Rect, Path, Image } from "@react-pdf/renderer";
import { Club } from "@/types";

// Dark recruitment-poster theme — distinct from the light sponsorship
// proposal template (lib/pdf/proposal-document.tsx), but built from the
// same brand hues (hsl(84 92% 55%) primary green, hsl(38 92% 55%) warning
// orange — see app/globals.css) so it reads as the same brand.
const COLOR = {
  bg: "#0a0a0a",
  panel: "#141414",
  border: "rgba(255,255,255,0.12)",
  ink: "#12181f",
  white: "#ffffff",
  muted: "#9aa3ad",
  primary: "#a1f623",
  primaryInk: "#1b2a12",
  orange: "#f2a53a",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.bg,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    color: COLOR.white,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  wordmark: { fontFamily: "Helvetica-Bold", fontSize: 13, color: COLOR.white, letterSpacing: 0.6 },
  tagline: { fontSize: 6.5, color: COLOR.muted, letterSpacing: 1.2, marginTop: 2 },

  ruleGreen: { width: 70, height: 4, backgroundColor: COLOR.primary, marginTop: 34, marginBottom: 14 },
  kicker: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLOR.primary, letterSpacing: 2 },
  headline: { fontSize: 46, fontFamily: "Helvetica-Bold", color: COLOR.white, lineHeight: 1.02, marginTop: 6 },
  ruleOrange: { width: 46, height: 4, backgroundColor: COLOR.orange, marginTop: 22, marginBottom: 18 },

  question: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLOR.white, lineHeight: 1.4 },
  body: { fontSize: 11, color: "#c9cdd2", lineHeight: 1.5, marginTop: 10 },

  featureList: { marginTop: 22 },
  feature: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLOR.white, marginBottom: 4 },

  tagRow: { flexDirection: "row", marginTop: 20 },
  tagText: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: COLOR.primary, letterSpacing: 1.5 },
  tagDot: { fontSize: 10.5, color: COLOR.primary, marginHorizontal: 6 },

  ctaSection: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    paddingTop: 28,
  },
  ctaLeft: { flex: 1, paddingRight: 24 },
  ctaHeadline: { fontSize: 24, fontFamily: "Helvetica-Bold", color: COLOR.orange },
  ctaBody: { fontSize: 10, color: "#c9cdd2", lineHeight: 1.5, marginTop: 8 },

  qrWrap: { alignItems: "center" },
  qrCaption: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: COLOR.primary, letterSpacing: 1, marginBottom: 8, textAlign: "center" },
  qrBox: { backgroundColor: COLOR.white, padding: 10, borderRadius: 6 },
  qrImage: { width: 108, height: 108 },

  footerRule: { height: 3, backgroundColor: COLOR.primary, marginTop: 40, marginBottom: 10 },
  footerText: { fontSize: 8, color: COLOR.muted },
});

function LogoMark() {
  return (
    <View style={styles.headerLeft}>
      <Svg width={26} height={26} style={{ marginRight: 9 }}>
        <Rect x={0} y={0} width={26} height={26} rx={6} fill={COLOR.primary} />
        <Path d="M9 7h6c2.6 0 4.3 1.7 4.3 4.3s-1.7 4.3-4.3 4.3h-3.4v5H9V7zm2.6 2.6v3.4h3.4c1.2 0 2-.9 2-1.7s-.8-1.7-2-1.7h-3.4z" fill={COLOR.primaryInk} />
      </Svg>
      <View>
        <Text style={styles.wordmark}>PANNA LEAGUE</Text>
        <Text style={styles.tagline}>SWITZERLAND · STREET FOOTBALL</Text>
      </View>
    </View>
  );
}

export function ClubPosterDocument({ club, qrDataUrl }: { club: Club; qrDataUrl: string }) {
  return (
    <Document title={`Panna League — Appel aux joueurs — ${club.name}`} author="Panna League Switzerland">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <LogoMark />
        </View>

        <View style={styles.ruleGreen} />
        <Text style={styles.kicker}>APPEL AUX JOUEURS</Text>
        <Text style={styles.headline}>PROUVE TES{"\n"}SKILLS</Text>
        <View style={styles.ruleOrange} />

        <Text style={styles.question}>Tu penses avoir ce qu&apos;il faut pour dominer l&apos;arène ?</Text>
        <Text style={styles.body}>
          La Panna League recherche les meilleurs talents de {club.name} pour s&apos;affronter dans la compétition
          ultime de street football.
        </Text>

        <View style={styles.featureList}>
          <Text style={styles.feature}>Du pur 1 contre 1</Text>
          <Text style={styles.feature}>Technique, Respect, Compétition</Text>
          <Text style={styles.feature}>Représente {club.name}</Text>
        </View>

        <View style={styles.tagRow}>
          <Text style={styles.tagText}>PLAY</Text>
          <Text style={styles.tagDot}>•</Text>
          <Text style={styles.tagText}>IMPROVE</Text>
          <Text style={styles.tagDot}>•</Text>
          <Text style={styles.tagText}>COMPETE</Text>
        </View>

        <View style={styles.ctaSection}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaHeadline}>REJOINS LA LIGUE</Text>
            <Text style={styles.ctaBody}>
              Scanne le QR code pour t&apos;inscrire, découvrir les règles et voir les prochaines dates de l&apos;arène.
            </Text>
          </View>
          <View style={styles.qrWrap}>
            <Text style={styles.qrCaption}>SCANNE POUR{"\n"}T&apos;INSCRIRE</Text>
            <View style={styles.qrBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop; this isn't next/image or an <img> */}
              <Image src={qrDataUrl} style={styles.qrImage} />
            </View>
          </View>
        </View>

        <View style={styles.footerRule} />
        <Text style={styles.footerText}>Panna League Switzerland · Panna League First — Lausanne · pannaleague@mycountryisgoodat.com</Text>
      </Page>
    </Document>
  );
}
