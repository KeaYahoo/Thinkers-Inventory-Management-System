import { Product } from "@/types/inventory";

type ProductTableProps = {
  products: Product[];
  loading: boolean;
};

export function ProductTable({ products, loading }: ProductTableProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-tims-border bg-tims-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-tims-text">Inventory</h2>
        <p className="mt-4 text-sm text-tims-muted">Loading inventory…</p>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="rounded-2xl border border-tims-border bg-tims-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-tims-text">Inventory</h2>
        <p className="mt-4 text-sm text-tims-muted">No products available yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-tims-border bg-tims-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-tims-text">Inventory</h2>
        <span className="text-sm text-tims-muted">
          {products.length} product{products.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-tims-muted">
            <tr>
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Unit</th>
              <th className="py-2 pr-4">Cost</th>
              <th className="py-2 pr-4">Markup</th>
              <th className="py-2 pr-4">Selling Price</th>
              <th className="py-2 pr-4">Remaining</th>
              <th className="py-2 pr-4">Purchase Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tims-border">
            {products.map((product) => {
              const lowStock = product.remaining <= product.minStock;
              return (
                <tr key={product.id} className="text-xs text-tims-text">
                  <td className="py-3 pr-4 font-semibold">{product.code}</td>
                  <td className="py-3 pr-4">
                    <div className="font-medium">{product.name}</div>
                    <p className="text-[11px] text-tims-muted">{product.description}</p>
                  </td>
                  <td className="py-3 pr-4">{product.category}</td>
                  <td className="py-3 pr-4">{product.stock}</td>
                  <td className="py-3 pr-4 uppercase">{product.unit}</td>
                  <td className="py-3 pr-4">R{product.cost.toLocaleString()}</td>
                  <td className="py-3 pr-4">{product.markup}%</td>
                  <td className="py-3 pr-4">
                    R{product.sellingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        lowStock
                          ? "bg-[#EFE3DC] text-[#7C4E33]"
                          : "bg-[#E7EFE9] text-tims-accent"
                      }`}
                    >
                      {product.remaining}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {new Date(product.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
