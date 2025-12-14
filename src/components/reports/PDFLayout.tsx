import { ReactNode } from "react";
import { Page, Text, View, Image as PdfImage, StyleSheet } from "@react-pdf/renderer";

type PDFLayoutProps = {
  title: string;
  generatedAt: string;
  logoSrc?: string;
  children: ReactNode;
};

const COLORS = {
  canvas: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  muted: "#64748B",
  brand: "#D10000",
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: COLORS.text,
    backgroundColor: COLORS.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 120, height: 36 },
  title: { fontSize: 20, fontWeight: 700, color: COLORS.brand },
  subtitle: { marginTop: 4, color: COLORS.muted, fontSize: 11 },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    color: COLORS.muted,
    fontSize: 10,
  },
  body: { flexGrow: 1 },
});

export default function PDFLayout({ title, generatedAt, logoSrc, children }: PDFLayoutProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {logoSrc ? (
            <View style={{ marginRight: 12 }}>
              <PdfImage src={logoSrc} style={styles.logo} />
            </View>
          ) : null}
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Thinkers Afrika Inventory Management System</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Generated: {generatedAt}</Text>
      </View>

      <View style={styles.body}>{children}</View>

      <View style={styles.footer} fixed>
        <Text>{title}</Text>
        <Text
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </View>
    </Page>
  );
}

