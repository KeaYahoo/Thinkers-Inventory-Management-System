import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-tims-bg py-10">
      <div className="mx-auto max-w-6xl px-4">
        <Dashboard />
      </div>
    </main>
  );
}
