'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useUI } from "@/context/UIContext";

const initialState = {
  name: "",
  contact: "",
  spares: "",
  location: "",
  specialty: "",
};

export default function NewSupplierPage() {
  const router = useRouter();
  const { createSupplier } = useSuppliers();
  const { showToast } = useUI();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    for (const [key, value] of Object.entries(form)) {
      if (value.trim() === "") return `Missing required field: ${key}`;
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const validationError = validate();
      if (validationError) throw new Error(validationError);

      await createSupplier({
        name: form.name.trim(),
        contact: form.contact.trim(),
        spares: form.spares.trim(),
        location: form.location.trim(),
        specialty: form.specialty.trim(),
      });
      showToast("Supplier created", "success");
      router.push("/suppliers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create supplier");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Partners</p>
        <h1 className="text-3xl font-semibold text-primary">New supplier</h1>
        <p className="text-sm text-primary-muted">Add a supplier for parts and services.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField label="Name" name="name" value={form.name} onChange={handleChange} required />
          <InputField label="Contact" name="contact" value={form.contact} onChange={handleChange} required />
          <InputField label="Spares" name="spares" value={form.spares} onChange={handleChange} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />
          <InputField
            label="Specialty"
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
            {submitting ? "Saving..." : "Create supplier"}
          </button>
        </form>
      </NexusBlock>
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function InputField({ label, name, className, ...rest }: FieldProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <input {...rest} name={name} className={`nexus-input focus-ring mt-1 ${className ?? ""}`} />
    </label>
  );
}

