import { Document, StyleSheet, Text, View } from "@react-pdf/renderer";
import PDFLayout from "./PDFLayout";

type ConsumptionProductRow = {
  productId: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  thinkersQuantity: number;
  otherQuantity: number;
  totalQuantity: number;
};

type ConsumptionReportSummary = {
  totalEntries: number;
  totalQuantity: number;
  thinkersQuantity: number;
  otherQuantity: number;
};

type ConsumptionReportPDFProps = {
  rows: ConsumptionProductRow[];
  summary: ConsumptionReportSummary;
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
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 110, height: 32 },
  title: { fontSize: 20, fontWeight: 700, color: COLORS.brand },
  subtitle: { marginTop: 4, color: COLORS.muted },
  generatedAt: { color: COLORS.muted, fontSize: 11, textAlign: "right" },
  section: { marginTop: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 10 },
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
  code: { flexBasis: "14%", flexGrow: 0 },
  name: { flexBasis: "34%", flexGrow: 1 },
  category: { flexBasis: "18%", flexGrow: 0 },
  thinkers: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
  other: { flexBasis: "10%", flexGrow: 0, textAlign: "right" },
  total: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
});

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const ROWS_PER_PAGE = 18;

export default function ConsumptionReportPDF({
  rows,
  summary,
  generatedAt,
  logoSrc,
  filtersLabel,
}: ConsumptionReportPDFProps) {
  const pages = chunk(rows, ROWS_PER_PAGE);

  return (
    <Document title="Consumption Report" author="Thinkers Afrika IMS">
      {(pages.length ? pages : [[]]).map((pageRows, pageIndex) => (
        <PDFLayout key={pageIndex} title="Consumption Report" generatedAt={generatedAt} logoSrc={logoSrc}>
          {pageIndex === 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Entries</Text>
                  <Text style={styles.summaryValue}>{summary.totalEntries.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total units</Text>
                  <Text style={styles.summaryValue}>{summary.totalQuantity.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Thinkers</Text>
                  <Text style={styles.summaryValue}>{summary.thinkersQuantity.toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryCard, { marginRight: 0 }]}>
                  <Text style={styles.summaryLabel}>Other</Text>
                  <Text style={styles.summaryValue}>{summary.otherQuantity.toLocaleString()}</Text>
                </View>
              </View>
              {filtersLabel ? (
                <Text style={{ marginTop: 10, fontSize: 11, color: COLORS.muted }}>{filtersLabel}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By product</Text>
            <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface }}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.code]}>Code</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.name]}>Product</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.category]}>Category</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.thinkers]}>Thinkers</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.other]}>Other</Text>
                <Text style={[styles.tableHeaderCell, styles.total]}>Total</Text>
              </View>

              {pageRows.length ? (
                pageRows.map((row, rowIndex) => {
                  const baseRow =
                    rowIndex % 2 === 0 ? { ...styles.tableRow, backgroundColor: "#F5F5F5" } : styles.tableRow;
                  const rowStyle = rowIndex === pageRows.length - 1 ? { ...baseRow, borderBottomWidth: 0 } : baseRow;
                  return (
                    <View key={row.productId} style={rowStyle}>
                      <Text style={[styles.cell, styles.code]}>{row.code}</Text>
                      <View style={[styles.cell, styles.name]}>
                        <Text style={{ fontWeight: 700 }}>{row.name}</Text>
                        <Text style={{ marginTop: 2, fontSize: 10, color: COLORS.muted }}>{row.unit}</Text>
                      </View>
                      <Text style={[styles.cell, styles.category]}>{row.category}</Text>
                      <Text style={[styles.cell, styles.thinkers]}>{row.thinkersQuantity.toLocaleString()}</Text>
                      <Text style={[styles.cell, styles.other]}>{row.otherQuantity.toLocaleString()}</Text>
                      <Text style={[styles.cell, styles.total]}>{row.totalQuantity.toLocaleString()}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={{ padding: 12 }}>
                  <Text style={{ color: COLORS.muted }}>No consumption data found for this filter.</Text>
                </View>
              )}
            </View>
          </View>
        </PDFLayout>
      ))}
    </Document>
  );
}
