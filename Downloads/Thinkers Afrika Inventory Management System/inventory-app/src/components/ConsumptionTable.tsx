'use client';

import { Consumption } from "@/types/inventory";

type ConsumptionTableProps = {
  records: Consumption[];
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
};

export function ConsumptionTable({ records, loading, onEdit, onDelete }: ConsumptionTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-tims-border bg-white p-6 shadow-sm">
        <p className="text-sm text-tims-muted">Loading consumption records…</p>
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="rounded-2xl border border-tims-border bg-white p-6 shadow-sm">
        <p className="text-sm text-tims-muted">No consumption recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-tims-border bg-white shadow-sm">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-tims-bg text-xs uppercase tracking-wide text-tims-muted">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Consumer</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tims-border text-tims-text">
          {records.map((record) => (
            <tr key={record.id} className="text-xs">
              <td className="px-4 py-3">
                <div className="font-semibold">{record.product?.code ?? record.productId}</div>
                <p className="text-[11px] text-tims-muted">{record.product?.name ?? "N/A"}</p>
              </td>
              <td className="px-4 py-3">{record.quantity}</td>
              <td className="px-4 py-3 capitalize">{record.type}</td>
              <td className="px-4 py-3">{record.consumer}</td>
              <td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(record.id)}
                    className="rounded-full border border-tims-border px-3 py-1 text-[11px] font-semibold text-tims-accent hover:border-tims-accent hover:bg-tims-accent hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
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
