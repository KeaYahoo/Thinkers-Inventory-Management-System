'use client';

import { Consumption } from "@/types/inventory";
import { NexusBlock } from "./NexusBlock";
import { StatusDot } from "./StatusDot";

type ConsumptionTableProps = {
  records: Consumption[];
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
};

function getTypeTone(type: string): "success" | "warning" | "critical" {
  switch (type.toLowerCase()) {
    case "sale":
      return "success";
    case "internal":
      return "warning";
    case "waste":
    case "expired":
      return "critical";
    default:
      return "warning";
  }
}

export function ConsumptionTable({ records, loading, onEdit, onDelete }: ConsumptionTableProps) {
  if (loading) {
    return (
      <NexusBlock className="p-6">
        <p className="text-sm text-primary-muted">Loading consumption records…</p>
      </NexusBlock>
    );
  }

  if (!records.length) {
    return (
      <NexusBlock className="p-6">
        <p className="text-sm text-primary-muted">No consumption recorded yet.</p>
      </NexusBlock>
    );
  }

  return (
    <NexusBlock className="overflow-x-auto">
      <table className="nexus-table min-w-[680px]">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Type</th>
            <th>Consumer</th>
            <th>Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="text-sm">
              <td>
                <div className="font-semibold">{record.product?.code ?? record.productId}</div>
                <p className="text-xs text-primary-muted">{record.product?.name ?? "N/A"}</p>
              </td>
              <td>{record.quantity}</td>
              <td>
                <span className="inline-flex items-center gap-2 capitalize">
                  <StatusDot tone={getTypeTone(record.type)} />
                  {record.type}
                </span>
              </td>
              <td>{record.consumer}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(record.id)}
                    className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand hover:border-brand hover:bg-brand hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(record.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white transition"
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





