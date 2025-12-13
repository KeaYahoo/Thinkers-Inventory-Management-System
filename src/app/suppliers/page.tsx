'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useUI } from "@/context/UIContext";

export default function SuppliersPage() {
  const router = useRouter();
  const { suppliers, isLoading, error, deleteSupplier } = useSuppliers();
  const { showToast } = useUI();

  const handleEdit = (id: number) => {
    router.push(`/suppliers/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this supplier?");
    if (!confirmed) return;
    try {
      await deleteSupplier(id);
      showToast("Supplier deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete supplier", "critical");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Partners</p>
            <h1 className="text-3xl font-semibold text-primary">Suppliers</h1>
          </div>
          <Link href="/suppliers/new" className="btn-brand focus-ring inline-flex items-center gap-2">
            + New Supplier
          </Link>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <table className="nexus-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Spares</th>
                  <th>Location</th>
                  <th>Specialty</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-2">
                      <div className="h-4 w-full rounded bg-brand-light" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : suppliers.length === 0 ? (
            <div className="p-6 text-sm text-primary-muted">
              No suppliers yet.{" "}
              <Link href="/suppliers/new" className="text-brand underline">
                Add one
              </Link>
              .
            </div>
          ) : (
            <table className="nexus-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Spares</th>
                  <th>Location</th>
                  <th>Specialty</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="text-sm">
                    <td className="font-semibold">{supplier.name}</td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.spares}</td>
                    <td>{supplier.location}</td>
                    <td>{supplier.specialty}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(supplier.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(supplier.id)}
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
          )}
        </NexusBlock>
      </div>
    </main>
  );
}

