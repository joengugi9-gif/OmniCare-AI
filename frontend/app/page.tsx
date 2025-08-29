import PublicNavbar from "@/components/PublicNavbar";

export default function HomePage() {
  return (
    <div>
      <PublicNavbar />
      <main className="pt-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to OmniCare AI</h1>
        <p className="text-lg text-gray-300">AI-Powered Customer Support</p>
      </main>
    </div>
  );
}
