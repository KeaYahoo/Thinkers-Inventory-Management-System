'use client';

import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import ProductForm from "@/components/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { useUI } from "@/context/UIContext";

export default function NewInventoryProductPage() {
  const router = useRouter();
  const { createProduct } = useProducts();
  const { showToast } = useUI();

  return (
    <Modal
      isOpen
      onClose={() => {
        router.push("/inventory");
        router.refresh();
      }}
      title="New product"
    >
      <ProductForm
        onSubmit={async (values) => {
          await createProduct(values);
          showToast("Product created", "success");
          router.push("/inventory");
          router.refresh();
        }}
      />
    </Modal>
  );
}
