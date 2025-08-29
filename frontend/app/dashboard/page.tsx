import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen p-8 bg-black text-white">
        <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
        <p>Welcome to OmniCare AI!</p>
      </main>
    </ProtectedRoute>
  );
}
