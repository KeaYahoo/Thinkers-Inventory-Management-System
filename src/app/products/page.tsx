'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/inventory";
import { ProductTable } from "@/components/ProductTable";
import { NexusBlock } from "@/components/NexusBlock";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = (await response.json()) as Product[];
      setProducts(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load products";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to delete product");
      }
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/products/${id}`);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Inventory</p>
            <h1 className="text-3xl font-semibold text-primary">Products</h1>
          </div>
          <Link
            href="/products/new"
            className="btn-brand focus-ring inline-flex items-center gap-2"
          >
            + New Product
          </Link>
        </NexusBlock>
        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </NexusBlock>
        )}
        <ProductTable products={products} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </main>
  );
}

