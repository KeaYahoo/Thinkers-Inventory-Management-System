'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

const initialState = {
  regNumber: "",
  description: "",
};

export default function NewVehiclePage() {
  const router = useRouter();
  const { createVehicle } = useVehicles();
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
      const regNumber = form.regNumber.trim();
      if (!regNumber) throw new Error("Registration number is required");

      await createVehicle({
        regNumber,
        description: form.description.trim() || undefined,
      });
      showToast("Vehicle created", "success");
      router.push("/vehicles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
        <h1 className="text-3xl font-semibold text-primary">New vehicle</h1>
        <p className="text-sm text-primary-muted">Add a vehicle for tracking usage and trips.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <InputField
            label="Registration number"
            name="regNumber"
            value={form.regNumber}
            onChange={handleChange}
            required
          />
          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Description (optional)
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
              {submitting ? "Saving..." : "Create vehicle"}
            </button>
          </div>
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
