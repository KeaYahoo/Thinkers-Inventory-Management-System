'use client';

import Link from "next/link";
import { Download, Plus, FileText } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import { useNightShiftReports } from "@/hooks/useNightShiftReports";
import { useUI } from "@/context/UIContext";

const staffCount = (staff: string) =>
  staff
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean).length;

export default function NightShiftListPage() {
  const { reports, isLoading, error, deleteReport } = useNightShiftReports();
  const { showToast } = useUI();

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this night shift report?")) return;
    try {
      await deleteReport(id);
      showToast("Night shift report deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete report", "critical");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
            <h1 className="text-3xl font-semibold text-primary">Night shift reports</h1>
            <p className="mt-1 text-sm text-primary-muted">Shift summaries, checklists, and incident notes.</p>
          </div>
          <Link href="/nightshift/new" className="btn-brand focus-ring inline-flex items-center gap-2">
            <Plus size={16} aria-hidden />
            New report
          </Link>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          <table className="nexus-table min-w-[900px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Staff</th>
                <th>Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                {Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-2">
                      <div className="h-4 w-full rounded bg-brand-light" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="text-sm">
                    <td className="font-semibold">
                      {new Date(report.date).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="text-primary-muted">{report.vehicle?.regNumber ?? "—"}</td>
                    <td className="font-semibold">{staffCount(report.staff)}</td>
                    <td className="text-primary-muted">
                      {report.shiftSummary.length > 80
                        ? `${report.shiftSummary.slice(0, 80)}...`
                        : report.shiftSummary}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/nightshift/${report.id}/view`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand underline"
                        >
                          <FileText size={14} aria-hidden />
                          View
                        </Link>
                        <Link
                          href={`/nightshift/${report.id}`}
                          className="text-sm font-semibold text-brand underline"
                        >
                          Edit
                        </Link>
                        <a
                          href={`/api/reports/nightshift/${report.id}/pdf`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand underline"
                          aria-label={`Download night shift report ${report.id} PDF`}
                        >
                          <Download size={14} aria-hidden />
                          PDF
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id)}
                          className="text-sm font-semibold text-status-critical underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!reports.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-primary-muted">
                      No night shift reports yet. Create your first report.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            )}
          </table>
        </NexusBlock>
      </div>
    </main>
  );
}

