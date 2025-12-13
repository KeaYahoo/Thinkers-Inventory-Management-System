'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NexusBlock } from "@/components/NexusBlock";
import { useNightShiftReports } from "@/hooks/useNightShiftReports";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

const initialState = {
  date: new Date().toISOString().split("T")[0],
  vehicleId: "",
  staff: "",
  shiftSummary: "",
  incidents: "",
  nonCompliance: "",
};

export default function NewNightShiftReportPage() {
  const router = useRouter();
  const { createReport } = useNightShiftReports();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { showToast } = useUI();

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!form.staff.trim()) throw new Error("Staff is required");
      if (!form.shiftSummary.trim()) throw new Error("Shift summary is required");

      await createReport({
        date: form.date,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        staff: form.staff,
        shiftSummary: form.shiftSummary,
        incidents: form.incidents.trim() ? form.incidents : null,
        nonCompliance: form.nonCompliance.trim() ? form.nonCompliance : null,
      });

      showToast("Night shift report created", "success");
      router.push("/nightshift");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
        <h1 className="mb-1 text-3xl font-semibold text-primary">New night shift report</h1>
        <p className="text-sm text-primary-muted">Capture the shift summary, checklists, and exceptions.</p>

        <div className="mt-3">
          <Link href="/nightshift" className="text-sm font-semibold text-brand underline">
            Back to night shift reports
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
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
              placeholder="John, Mary, Sam"
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
              {submitting ? "Saving..." : "Create report"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

