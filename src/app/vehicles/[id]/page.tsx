'use client';

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicle, useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditVehiclePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { vehicle, isLoading, error: loadError } = useVehicle(id);
  const { updateVehicle } = useVehicles();
  const { showToast } = useUI();

  const [form, setForm] = useState({ regNumber: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicle) return;
    setForm({
      regNumber: vehicle.regNumber ?? "",
      description: vehicle.description ?? "",
    });
  }, [vehicle]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const regNumber = form.regNumber.trim();
      if (!regNumber) throw new Error("Registration number is required");

      await updateVehicle(Number(id), {
        regNumber,
        description: form.description.trim() || undefined,
      });

      showToast("Vehicle updated", "success");
      router.push("/vehicles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8 text-sm text-primary-muted">
          Loading vehicle...
        </NexusBlock>
      </main>
    );
  }

  if (loadError || !vehicle) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {loadError?.message ?? "Vehicle not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
        <h1 className="text-3xl font-semibold text-primary">Edit vehicle</h1>
        <p className="text-sm text-primary-muted">Update vehicle details below.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/vehicles/${id}/stock`}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-primary transition hover:bg-canvas"
          >
            View Stock
          </Link>
          <Link
            href={`/vehicles/${id}/logs`}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-primary transition hover:bg-canvas"
          >
            View Logs
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label="Registration number"
            name="regNumber"
            value={form.regNumber}
            onChange={handleChange}
            required
          />
          <label className="text-xs font-medium text-primary-muted">
            Description (optional)
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>
          <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
            {submitting ? "Saving..." : "Update vehicle"}
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
