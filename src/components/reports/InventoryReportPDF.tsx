import { Document, Image as PdfImage, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type ReportProduct = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  remaining: number;
  minStock: number;
  cost: number;
  sellingPrice: number;
};

type ReportSummary = {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRemainingUnits: number;
};

type InventoryReportPDFProps = {
  products: ReportProduct[];
  summary: ReportSummary;
  generatedAt: string;
  logoSrc?: string;
};

const COLORS = {
  canvas: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  muted: "#64748B",
  brand: "#D10000",
  success: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
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
  generatedAt: { color: COLORS.muted, fontSize: 9 },
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
  table: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
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
  code: { flexBasis: "12%", flexGrow: 0 },
  name: { flexBasis: "26%", flexGrow: 1 },
  category: { flexBasis: "16%", flexGrow: 0 },
  remaining: { flexBasis: "14%", flexGrow: 0, textAlign: "right" },
  cost: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
  selling: { flexBasis: "12%", flexGrow: 0, textAlign: "right" },
  status: { flexBasis: "16%", flexGrow: 0, alignItems: "flex-end" },
  statusPill: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.surface,
  },
  footerNote: { marginTop: 10, fontSize: 9, color: COLORS.muted },
});

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const ROWS_PER_PAGE = 18;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatus(remaining: number, minStock: number) {
  if (remaining <= 0) return { label: "Out of stock", color: COLORS.critical };
  if (remaining <= minStock) return { label: "Low stock", color: COLORS.warning };
  return { label: "In stock", color: COLORS.success };
}

export default function InventoryReportPDF({
  products,
  summary,
  generatedAt,
  logoSrc,
}: InventoryReportPDFProps) {
  const pages = chunk(products, ROWS_PER_PAGE);
  const safePages = pages.length ? pages : [[]];

  return (
    <Document title="Inventory Report" author="Thinkers Afrika IMS">
      {safePages.map((pageProducts, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoSrc ? (
                <View style={{ marginRight: 10 }}>
                  <PdfImage src={logoSrc} style={styles.logo} />
                </View>
              ) : null}
              <View>
                <Text style={styles.title}>Inventory Report</Text>
                <Text style={styles.subtitle}>Thinkers Afrika Inventory Management System</Text>
              </View>
            </View>
            <Text style={styles.generatedAt}>Generated: {generatedAt}</Text>
          </View>

          {pageIndex === 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total products</Text>
                  <Text style={styles.summaryValue}>{summary.totalProducts.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Low stock</Text>
                  <Text style={styles.summaryValue}>{summary.lowStockCount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Out of stock</Text>
                  <Text style={styles.summaryValue}>{summary.outOfStockCount.toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryCard, { marginRight: 0 }]}>
                  <Text style={styles.summaryLabel}>Remaining units</Text>
                  <Text style={styles.summaryValue}>{summary.totalRemainingUnits.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product details</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.code]}>Code</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.name]}>Product</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.category]}>Category</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.remaining]}>Rem/Min</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.cost]}>Cost</Text>
                <Text style={[styles.tableHeaderCell, styles.cell, styles.selling]}>Sell</Text>
                <Text style={[styles.tableHeaderCell, styles.status]}>Status</Text>
              </View>

              {pageProducts.length ? (
                pageProducts.map((product, index) => {
                  const status = getStatus(product.remaining, product.minStock);
                  const rowStyle =
                    index === pageProducts.length - 1 ? [styles.tableRow, { borderBottomWidth: 0 }] : styles.tableRow;
                  return (
                    <View key={product.id} style={rowStyle}>
                      <Text style={[styles.cell, styles.code]}>{product.code}</Text>
                      <View style={[styles.cell, styles.name]}>
                        <Text style={{ fontWeight: 700 }}>{product.name}</Text>
                        {product.description ? (
                          <Text style={{ marginTop: 2, fontSize: 9, color: COLORS.muted }}>
                            {product.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.cell, styles.category]}>{product.category}</Text>
                      <Text style={[styles.cell, styles.remaining]}>
                        {product.remaining} / {product.minStock}
                      </Text>
                      <Text style={[styles.cell, styles.cost]}>{formatCurrency(product.cost)}</Text>
                      <Text style={[styles.cell, styles.selling]}>{formatCurrency(product.sellingPrice)}</Text>
                      <View style={styles.status}>
                        <Text style={[styles.statusPill, { backgroundColor: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={{ padding: 12 }}>
                  <Text style={{ color: COLORS.muted }}>No products found.</Text>
                </View>
              )}
            </View>

            {pageIndex === safePages.length - 1 ? (
              <Text style={styles.footerNote}>
                Low-stock items are flagged when remaining units are less than or equal to the minimum stock threshold.
              </Text>
            ) : null}
          </View>
        </Page>
      ))}
    </Document>
  );
}
