'use client';

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import { useNightShiftReport, useNightShiftReports } from "@/hooks/useNightShiftReports";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

type PageProps = { params: Promise<{ id: string }> };

export default function EditNightShiftReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { report, isLoading, error } = useNightShiftReport(id);
  const { updateReport } = useNightShiftReports();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { showToast } = useUI();

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    vehicleId: "",
    staff: "",
    shiftSummary: "",
    incidents: "",
    nonCompliance: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    setForm({
      date: report.date.slice(0, 10),
      vehicleId: report.vehicleId ? String(report.vehicleId) : "",
      staff: report.staff ?? "",
      shiftSummary: report.shiftSummary ?? "",
      incidents: report.incidents ?? "",
      nonCompliance: report.nonCompliance ?? "",
    });
  }, [report]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      if (!form.staff.trim()) throw new Error("Staff is required");
      if (!form.shiftSummary.trim()) throw new Error("Shift summary is required");

      await updateReport(Number(id), {
        date: form.date,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        staff: form.staff,
        shiftSummary: form.shiftSummary,
        incidents: form.incidents.trim() ? form.incidents : null,
        nonCompliance: form.nonCompliance.trim() ? form.nonCompliance : null,
      });

      showToast("Night shift report updated", "success");
      router.push("/nightshift");
      router.refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8 text-sm text-primary-muted">
          Loading report...
        </NexusBlock>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {error?.message ?? "Report not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-primary">Edit night shift report</h1>
            <p className="mt-1 text-sm text-primary-muted">Update shift notes and checklist details.</p>
          </div>
          <a
            href={`/api/reports/nightshift/${id}/pdf`}
            aria-label="Download night shift report PDF"
            className="btn-brand focus-ring inline-flex items-center gap-2"
          >
            <Download size={16} aria-hidden />
            PDF
          </a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/nightshift" className="font-semibold text-brand underline">
            Back to list
          </Link>
          <Link href={`/nightshift/${id}/view`} className="font-semibold text-brand underline">
            View report
          </Link>
        </div>

        {localError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted">
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Vehicle (optional)
            <select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              disabled={vehiclesLoading}
              className="nexus-input focus-ring mt-1"
            >
              <option value="">No vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.regNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Staff (comma-separated)
            <input
              name="staff"
              value={form.staff}
              onChange={handleChange}
              required
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Shift summary
            <textarea
              name="shiftSummary"
              value={form.shiftSummary}
              onChange={handleChange}
              required
              rows={5}
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Incidents (optional)
            <textarea
              name="incidents"
              value={form.incidents}
              onChange={handleChange}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Non-compliance (optional)
            <textarea
              name="nonCompliance"
              value={form.nonCompliance}
              onChange={handleChange}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
              {submitting ? "Saving..." : "Update report"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

