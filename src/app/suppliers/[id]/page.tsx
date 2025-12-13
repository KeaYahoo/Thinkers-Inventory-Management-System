'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useSupplier, useSuppliers } from "@/hooks/useSuppliers";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditSupplierPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { supplier, isLoading, error: loadError } = useSupplier(id);
  const { updateSupplier } = useSuppliers();
  const { showToast } = useUI();

  const [form, setForm] = useState({
    name: "",
    contact: "",
    spares: "",
    location: "",
    specialty: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supplier) return;
    setForm({
      name: supplier.name ?? "",
      contact: supplier.contact ?? "",
      spares: supplier.spares ?? "",
      location: supplier.location ?? "",
      specialty: supplier.specialty ?? "",
    });
  }, [supplier]);

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

      await updateSupplier(Number(id), {
        name: form.name.trim(),
        contact: form.contact.trim(),
        spares: form.spares.trim(),
        location: form.location.trim(),
        specialty: form.specialty.trim(),
      });

      showToast("Supplier updated", "success");
      router.push("/suppliers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update supplier");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8 text-sm text-primary-muted">
          Loading supplier...
        </NexusBlock>
      </main>
    );
  }

  if (loadError || !supplier) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {loadError?.message ?? "Supplier not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Partners</p>
        <h1 className="text-3xl font-semibold text-primary">Edit supplier</h1>
        <p className="text-sm text-primary-muted">Update supplier details below.</p>

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
            {submitting ? "Saving..." : "Update supplier"}
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

