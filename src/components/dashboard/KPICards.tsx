import { Consumption, Product } from "@/types/inventory";

type KPICardsProps = {
  products: Product[];
  consumption: Consumption[];
  loading: boolean;
};

const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-ZA", options).format(value);

export function KPICards({ products, consumption, loading }: KPICardsProps) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const totalInventory = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.remaining <= product.minStock).length;
  const monthlyRevenue = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.remaining,
    0,
  );
  const weeklyConsumption = consumption
    .filter((entry) => new Date(entry.date) >= weekAgo)
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const cards = [
    {
      title: "Total Inventory",
      value: loading ? "…" : formatNumber(totalInventory),
      subtext: "Units on hand",
      accent: "text-brand",
    },
    {
      title: "Weekly Consumption",
      value: loading ? "…" : `${formatNumber(weeklyConsumption)} units`,
      subtext: "Usage over the last 7 days",
      accent: "text-status-warning",
    },
    {
      title: "Low Stock Alerts",
      value: loading ? "…" : lowStock.toString(),
      subtext: "Products at or below threshold",
      accent: "text-status-critical",
    },
    {
      title: "Monthly Revenue",
      value: loading ? "…" : `R${formatNumber(monthlyRevenue, { maximumFractionDigits: 0 })}`,
      subtext: "Projected from current inventory",
      accent: "text-brand-hover",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="nexus-block p-5"
        >
          <p className="text-sm text-primary-muted">{card.title}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
          <p className="text-xs text-primary-muted">{card.subtext}</p>
        </article>
      ))}
    </div>
  );
}



