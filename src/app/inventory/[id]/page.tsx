'use client';

import { use } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import ProductForm from "@/components/ProductForm";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditInventoryProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { product, isLoading: productLoading, error: productError } = useProduct(id);
  const { updateProduct } = useProducts();
  const { showToast } = useUI();

  return (
    <Modal
      isOpen
      onClose={() => {
        router.push("/inventory");
        router.refresh();
      }}
      title="Edit product"
    >
      {productLoading ? (
        <div className="text-sm text-primary-muted">Loading product...</div>
      ) : productError || !product ? (
        <div className="text-sm text-red-600" role="alert">
          {productError?.message ?? "Product not found"}
        </div>
      ) : (
        <ProductForm
          initialData={product}
          onSubmit={async (values) => {
            await updateProduct(Number(id), values);
            showToast("Product updated", "success");
            router.push("/inventory");
            router.refresh();
          }}
        />
      )}
    </Modal>
  );
}
