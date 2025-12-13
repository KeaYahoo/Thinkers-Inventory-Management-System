'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Package, Repeat, Truck } from "lucide-react";
import { ProductTable } from "@/components/ProductTable";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

export default function InventoryPage() {
  const router = useRouter();
  const { products, isLoading, error, deleteProduct } = useProducts();
  const { totalCount, criticalCount, warningCount } = useLowStockAlerts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();
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
    </main>
  );
}

type SummaryCardProps = {
  icon: typeof Package;
  label: string;
  value: number;
};

function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-brand-light p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-primary">{value.toLocaleString()}</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-primary-muted">{label}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand shadow-sm">
          <Icon size={18} aria-hidden />
        </div>
      </div>
    </div>
  );
}
