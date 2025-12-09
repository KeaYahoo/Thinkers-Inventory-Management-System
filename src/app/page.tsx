import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Dashboard />
      </div>
    </main>
  );
}

