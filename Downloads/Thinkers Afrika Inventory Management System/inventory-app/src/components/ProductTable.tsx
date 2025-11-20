'use client';

import Link from "next/link";
import { Product } from "@/types/inventory";

type ProductTableProps = {
  products: Product[];
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(
    value,
  );

export function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-tims-border bg-white p-6 shadow-sm">
        <p className="text-sm text-tims-muted">Loading products…</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-tims-border bg-white p-6 shadow-sm">
        <p className="text-sm text-tims-muted">
          No products yet.{" "}
          <Link className="text-tims-accent underline" href="/products/new">
            Create one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-tims-border bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-tims-bg text-xs uppercase tracking-wide text-tims-muted">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Selling Price</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tims-border text-tims-text">
          {products.map((product) => (
            <tr key={product.id} className="text-xs">
              <td className="px-4 py-3 font-semibold">{product.code}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{product.name}</div>
                <p className="text-[11px] text-tims-muted">{product.description}</p>
              </td>
              <td className="px-4 py-3">{product.category}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3 uppercase">{product.unit}</td>
              <td className="px-4 py-3">{currency(product.cost)}</td>
              <td className="px-4 py-3">{currency(product.sellingPrice)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="rounded-full border border-tims-border px-3 py-1 text-[11px] font-semibold text-tims-accent hover:border-tims-accent hover:text-white hover:bg-tims-accent transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
