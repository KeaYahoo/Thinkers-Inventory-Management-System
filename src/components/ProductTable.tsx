'use client';

import Link from "next/link";
import { Product } from "@/types/inventory";
import { NexusBlock } from "./NexusBlock";
import { StatusPill } from "./StatusPill";

type ProductTableProps = {
  products: Product[];
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
  createHref?: string;
  createLabel?: string;
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(
    value,
  );

function getStockTone(remaining: number, minStock: number): "success" | "warning" | "critical" {
  if (remaining <= 0) return "critical";
  if (remaining <= minStock) return "warning";
  return "success";
}

function getStockLabel(remaining: number, minStock: number): string {
  if (remaining <= 0) return "Out of stock";
  if (remaining <= minStock) return "Low stock";
  return "In stock";
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  createHref = "/inventory/new",
  createLabel = "Create one",
}: ProductTableProps) {
  if (loading) {
    return (
      <NexusBlock className="p-6">
        <p className="text-sm text-primary-muted">Loading products…</p>
      </NexusBlock>
    );
  }

  if (!products.length) {
    return (
      <NexusBlock className="p-6">
        <p className="text-sm text-primary-muted">
          No products yet.{" "}
          <Link className="text-brand underline" href={createHref}>
            {createLabel}
          </Link>
          .
        </p>
      </NexusBlock>
    );
  }

  return (
    <NexusBlock className="overflow-x-auto">
      <table className="nexus-table min-w-[720px]">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Unit</th>
            <th>Cost</th>
            <th>Selling Price</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="text-sm">
              <td className="font-semibold">{product.code}</td>
              <td>
                <div className="font-medium">{product.name}</div>
                <p className="text-xs text-primary-muted">{product.description}</p>
              </td>
              <td>{product.category}</td>
              <td>
                <StatusPill tone={getStockTone(product.remaining, product.minStock)}>
                  {product.remaining} • {getStockLabel(product.remaining, product.minStock)}
                </StatusPill>
              </td>
              <td className="uppercase">{product.unit}</td>
              <td>{currency(product.cost)}</td>
              <td>{currency(product.sellingPrice)}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(product.id)}
                    className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </NexusBlock>
  );
}
