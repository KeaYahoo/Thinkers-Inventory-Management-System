import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default function ProductRedirectPage({ params }: PageProps) {
  redirect(`/inventory/${params.id}`);
}

