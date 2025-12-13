import { Document, Image as PdfImage, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type NightShiftReportData = {
  id: number;
  date: string | Date;
  staff: string;
  shiftSummary: string;
  incidents?: string | null;
  nonCompliance?: string | null;
  vehicle?: { regNumber: string } | null;
};

type NightShiftReportPDFProps = {
  report: NightShiftReportData;
  generatedAt: string;
  logoSrc?: string;
};

const checklistItems = [
  "Vehicle inspected and secured",
  "Fuel level recorded",
  "Tyres and wheel nuts checked",
  "Lights and indicators checked",
  "Tools and spares accounted for",
  "Incidents logged (if any)",
  "Non-compliance noted (if any)",
];

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
    padding: 24,
    fontSize: 10,
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
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 110, height: 32 },
  title: { fontSize: 16, fontWeight: 700, color: COLORS.brand },
  subtitle: { marginTop: 4, color: COLORS.muted },
  generatedAt: { color: COLORS.muted, fontSize: 9, textAlign: "right" },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 8 },
  metaRow: { flexDirection: "row" },
  metaCard: {
    flexGrow: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  metaLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase" },
  metaValue: { marginTop: 4, fontSize: 12, fontWeight: 700 },
  block: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bodyText: { fontSize: 10, lineHeight: 1.35 },
  listItem: { flexDirection: "row", marginBottom: 6 },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
  },
  smallMuted: { color: COLORS.muted, fontSize: 9 },
});

const splitStaff = (staff: string) =>
  staff
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

export default function NightShiftReportPDF({ report, generatedAt, logoSrc }: NightShiftReportPDFProps) {
  const staff = splitStaff(report.staff);
  const reportDate = report.date instanceof Date ? report.date : new Date(report.date);
  const reportDateLabel = Number.isNaN(reportDate.getTime())
    ? String(report.date)
    : reportDate.toLocaleDateString("en-ZA");

  return (
    <Document title={`Night Shift Report #${report.id}`} author="Thinkers Afrika IMS">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoSrc ? (
              <View style={{ marginRight: 10 }}>
                <PdfImage src={logoSrc} style={styles.logo} />
              </View>
            ) : null}
            <View>
              <Text style={styles.title}>Night Shift Report</Text>
              <Text style={styles.subtitle}>Thinkers Afrika Inventory Management System</Text>
              <Text style={styles.subtitle}>Report #{report.id}</Text>
            </View>
          </View>
          <Text style={styles.generatedAt}>Generated: {generatedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift details</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{reportDateLabel}</Text>
            </View>
            <View style={[styles.metaCard, { marginRight: 0 }]}>
              <Text style={styles.metaLabel}>Vehicle</Text>
              <Text style={styles.metaValue}>{report.vehicle?.regNumber ?? "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff</Text>
          <View style={styles.block}>
            {staff.length ? (
              staff.map((name) => (
                <Text key={name} style={[styles.bodyText, { marginBottom: 4 }]}>
                  • {name}
                </Text>
              ))
            ) : (
              <Text style={styles.smallMuted}>No staff recorded.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          <View style={styles.block}>
            {checklistItems.map((item) => (
              <View key={item} style={styles.listItem}>
                <View style={styles.checkbox} />
                <Text style={styles.bodyText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.smallMuted, { marginTop: 6 }]}>
            Use this checklist as a template for night-shift handover and compliance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift summary</Text>
          <View style={styles.block}>
            <Text style={styles.bodyText}>{report.shiftSummary || "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incidents</Text>
          <View style={styles.block}>
            <Text style={styles.bodyText}>{report.incidents?.trim() ? report.incidents : "None reported."}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Non-compliance</Text>
          <View style={styles.block}>
            <Text style={styles.bodyText}>
              {report.nonCompliance?.trim() ? report.nonCompliance : "None reported."}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
