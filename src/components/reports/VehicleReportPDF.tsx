import { Document, Image as PdfImage, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type VehicleRow = {
  id: number;
  regNumber: string;
  description?: string | null;
  onRoadUnits: number;
  logCount: number;
  transferCount: number;
};

type VehicleReportSummary = {
  totalVehicles: number;
  totalOnRoadUnits: number;
  totalLogs: number;
  totalTransfers: number;
};

type VehicleReportPDFProps = {
  vehicles: VehicleRow[];
  summary: VehicleReportSummary;
  generatedAt: string;
  logoSrc?: string;
  filtersLabel?: string;
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 110, height: 32 },
  title: { fontSize: 16, fontWeight: 700, color: COLORS.brand },
  subtitle: { marginTop: 4, color: COLORS.muted },
  generatedAt: { color: COLORS.muted, fontSize: 9, textAlign: "right" },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 8 },
  summaryRow: { flexDirection: "row" },
  summaryCard: {
    flexGrow: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  summaryLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase" },
  summaryValue: { marginTop: 4, fontSize: 14, fontWeight: 700 },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cell: { paddingRight: 6 },
  reg: { flexBasis: "18%", flexGrow: 0 },
  desc: { flexBasis: "34%", flexGrow: 1 },
  stock: { flexBasis: "16%", flexGrow: 0, textAlign: "right" },
  logs: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
  transfers: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
});

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const ROWS_PER_PAGE = 18;

export default function VehicleReportPDF({
  vehicles,
  summary,
  generatedAt,
  logoSrc,
  filtersLabel,
}: VehicleReportPDFProps) {
  const pages = chunk(vehicles, ROWS_PER_PAGE);

  return (
    <Document title="Vehicle Report" author="Thinkers Afrika IMS">
      {pages.length ? (
        pages.map((rows, pageIndex) => (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {logoSrc ? (
                  <View style={{ marginRight: 10 }}>
                    <PdfImage src={logoSrc} style={styles.logo} />
                  </View>
                ) : null}
                <View>
                  <Text style={styles.title}>Vehicle Report</Text>
                  <Text style={styles.subtitle}>Thinkers Afrika Inventory Management System</Text>
                  {filtersLabel ? <Text style={styles.subtitle}>{filtersLabel}</Text> : null}
                </View>
              </View>
              <Text style={styles.generatedAt}>Generated: {generatedAt}</Text>
            </View>

            {pageIndex === 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Vehicles</Text>
                    <Text style={styles.summaryValue}>{summary.totalVehicles.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>On-road units</Text>
                    <Text style={styles.summaryValue}>{summary.totalOnRoadUnits.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Logs</Text>
                    <Text style={styles.summaryValue}>{summary.totalLogs.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.summaryCard, { marginRight: 0 }]}>
                    <Text style={styles.summaryLabel}>Transfers</Text>
                    <Text style={styles.summaryValue}>{summary.totalTransfers.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicles</Text>
              <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface }}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.cell, styles.reg]}>Registration</Text>
                  <Text style={[styles.tableHeaderCell, styles.cell, styles.desc]}>Description</Text>
                  <Text style={[styles.tableHeaderCell, styles.cell, styles.stock]}>On-road</Text>
                  <Text style={[styles.tableHeaderCell, styles.cell, styles.logs]}>Logs</Text>
                  <Text style={[styles.tableHeaderCell, styles.transfers]}>Transfers</Text>
                </View>
                {rows.map((vehicle, rowIndex) => {
                  const isLast = rowIndex === rows.length - 1;
                  const rowStyle = isLast ? [styles.tableRow, { borderBottomWidth: 0 }] : styles.tableRow;
                  return (
                    <View key={vehicle.id} style={rowStyle}>
                      <Text style={[styles.cell, styles.reg]}>{vehicle.regNumber}</Text>
                      <Text style={[styles.cell, styles.desc]}>{vehicle.description || "—"}</Text>
                      <Text style={[styles.cell, styles.stock]}>{vehicle.onRoadUnits.toLocaleString()}</Text>
                      <Text style={[styles.cell, styles.logs]}>{vehicle.logCount.toLocaleString()}</Text>
                      <Text style={styles.transfers}>{vehicle.transferCount.toLocaleString()}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Page>
        ))
      ) : (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoSrc ? (
                <View style={{ marginRight: 10 }}>
                  <PdfImage src={logoSrc} style={styles.logo} />
                </View>
              ) : null}
              <View>
                <Text style={styles.title}>Vehicle Report</Text>
                <Text style={styles.subtitle}>Thinkers Afrika Inventory Management System</Text>
              </View>
            </View>
            <Text style={styles.generatedAt}>Generated: {generatedAt}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
            <Text style={{ color: COLORS.muted }}>No vehicles found.</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
