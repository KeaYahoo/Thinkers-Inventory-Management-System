'use client';

import Link from "next/link";
import { useState } from "react";
import { Bell, Package, Repeat, Truck } from "lucide-react";
import { ProductTable } from "@/components/ProductTable";
import { NexusBlock } from "@/components/NexusBlock";
import Modal from "@/components/Modal";
import ProductForm from "@/components/ProductForm";
import SummaryCard from "@/components/SummaryCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

export default function InventoryPage() {
  const { products, isLoading, error, deleteProduct, createProduct, updateProduct } = useProducts();
  const { totalCount, criticalCount, warningCount } = useLowStockAlerts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();
  const { showToast } = useUI();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const { product: editingProduct, isLoading: editingLoading, error: editingError } = useProduct(
    editingProductId ?? undefined,
  );

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
    setEditingProductId(id);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Inventory</p>
            <h1 className="text-3xl font-semibold text-primary">Inventory</h1>
          </div>
          <button
            type="button"
            className="btn-brand focus-ring inline-flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            + New Product
          </button>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Summary</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={Package} label="Total products" value={products.length} />
            <SummaryCard icon={Bell} label="Low-stock alerts" value={totalCount} />
            <SummaryCard icon={Repeat} label="Transfers" value={transfers.length} />
            <SummaryCard icon={Truck} label="Vehicles" value={vehicles.length} />
          </div>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        {totalCount > 0 && (
          <NexusBlock className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-4 sm:p-5">
            <div className="text-sm text-primary-muted">
              <span className="font-semibold text-primary">{totalCount}</span> low-stock alert
              {totalCount === 1 ? "" : "s"}:
              <span className="ml-2 font-semibold text-primary">{criticalCount}</span> out of stock,{" "}
              <span className="font-semibold text-primary">{warningCount}</span> low stock.
            </div>
            <Link href="/alerts" className="text-sm font-semibold text-brand underline">
              View alerts
            </Link>
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New product"
      >
        <ProductForm
          onSubmit={async (values) => {
            await createProduct(values);
            setShowCreateModal(false);
            showToast("Product created", "success");
          }}
        />
      </Modal>

      <Modal
        isOpen={editingProductId !== null}
        onClose={() => setEditingProductId(null)}
        title="Edit product"
      >
        {editingLoading ? (
          <div className="text-sm text-primary-muted">Loading product...</div>
        ) : editingError ? (
          <div className="text-sm text-red-600" role="alert">
            {editingError.message}
          </div>
        ) : editingProduct ? (
          <ProductForm
            initialData={editingProduct}
            onSubmit={async (values) => {
              await updateProduct(editingProduct.id, values);
              setEditingProductId(null);
              showToast("Product updated", "success");
            }}
          />
        ) : (
          <div className="text-sm text-primary-muted">Select a product to edit.</div>
        )}
      </Modal>
    </main>
  );
}
