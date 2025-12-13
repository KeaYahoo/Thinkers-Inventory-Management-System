'use client';

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicle } from "@/hooks/useVehicles";
import { useVehicleLogs } from "@/hooks/useVehicleLogs";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

const initialState = {
  date: new Date().toISOString().split("T")[0],
  location: "",
  liters: "",
  cost: "",
  tripDetails: "",
};

export default function NewVehicleLogPage({ params }: PageProps) {
  const { id } = use(params);
  const vehicleId = Number(id);
  const router = useRouter();
  const { vehicle } = useVehicle(id);
  const { createVehicleLog } = useVehicleLogs(vehicleId);
  const { showToast } = useUI();

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const location = form.location.trim();
      if (!form.date) throw new Error("Date is required");
      if (!location) throw new Error("Location is required");

      const liters = Number(form.liters);
      const cost = Number(form.cost);
      if (!Number.isFinite(liters) || liters <= 0) throw new Error("Liters must be greater than zero");
      if (!Number.isFinite(cost) || cost < 0) throw new Error("Cost must be 0 or greater");

      await createVehicleLog(vehicleId, {
        date: form.date,
        location,
        liters,
        cost,
        tripDetails: form.tripDetails.trim() || undefined,
      });

      showToast("Log created", "success");
      router.push(`/vehicles/${id}/logs`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
        <h1 className="text-3xl font-semibold text-primary">
          {vehicle ? `New log – ${vehicle.regNumber}` : "New vehicle log"}
        </h1>
        <p className="text-sm text-primary-muted">Record fuel or usage for this vehicle.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField type="date" label="Date" name="date" value={form.date} onChange={handleChange} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Liters" name="liters" value={form.liters} onChange={handleChange} required />
            <InputField label="Cost" name="cost" value={form.cost} onChange={handleChange} required />
          </div>
          <label className="text-xs font-medium text-primary-muted">
            Trip details (optional)
            <textarea
              name="tripDetails"
              value={form.tripDetails}
              onChange={handleChange}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>
          <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
            {submitting ? "Saving..." : "Create log"}
          </button>
        </form>
      </NexusBlock>
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function InputField({ label, name, className, ...rest }: FieldProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <input {...rest} name={name} className={`nexus-input focus-ring mt-1 ${className ?? ""}`} />
    </label>
  );
}

