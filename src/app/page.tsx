'use client';

import Link from "next/link";
import { Bell, Package, Repeat, ShoppingCart, Truck, Users } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { useConsumption } from "@/hooks/useConsumption";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";

type QuickLinkProps = {
  href: string;
  label: string;
};

function QuickLink({ href, label }: QuickLinkProps) {
  return (
    <Link className="text-sm font-semibold text-brand underline" href={href}>
      {label}
    </Link>
  );
}

export default function DashboardPage() {
  const { products } = useProducts();
  const { totalCount } = useLowStockAlerts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();
  const { suppliers } = useSuppliers();
  const { consumption } = useConsumption();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold text-primary">Dashboard</h1>
          <p className="mt-2 text-sm text-primary-muted">A quick snapshot across inventory, fleet and operations.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <SummaryCard icon={Package} label="Total products" value={products.length} />
              <QuickLink href="/inventory" label="View inventory" />
            </div>
            <div className="space-y-2">
              <SummaryCard icon={Bell} label="Low-stock alerts" value={totalCount} />
              <QuickLink href="/alerts" label="View alerts" />
            </div>
            <div className="space-y-2">
              <SummaryCard icon={Repeat} label="Transfers" value={transfers.length} />
              <QuickLink href="/transfers" label="View transfers" />
            </div>
            <div className="space-y-2">
              <SummaryCard icon={Truck} label="Vehicles" value={vehicles.length} />
              <QuickLink href="/vehicles" label="Manage vehicles" />
            </div>
            <div className="space-y-2">
              <SummaryCard icon={Users} label="Suppliers" value={suppliers.length} />
              <QuickLink href="/suppliers" label="View suppliers" />
            </div>
            <div className="space-y-2">
              <SummaryCard icon={ShoppingCart} label="Consumption logs" value={consumption.length} />
              <QuickLink href="/consumption" label="View consumption" />
            </div>
          </div>
        </NexusBlock>
      </div>
    </main>
  );
}
