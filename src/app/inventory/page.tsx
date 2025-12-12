'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductTable } from "@/components/ProductTable";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useUI } from "@/context/UIContext";

export default function InventoryPage() {
  const router = useRouter();
  const { products, isLoading, error, deleteProduct } = useProducts();
  const { showToast } = useUI();

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;
    try {
      await deleteProduct(id);
      showToast("Product deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete product", "critical");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/inventory/${id}`);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Inventory</p>
            <h1 className="text-3xl font-semibold text-primary">Inventory</h1>
          </div>
          <Link href="/inventory/new" className="btn-brand focus-ring inline-flex items-center gap-2">
            + New Product
          </Link>
        </NexusBlock>
        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}
        <ProductTable
          products={products}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createHref="/inventory/new"
          createLabel="Add one"
        />
      </div>
    </main>
  );
}
