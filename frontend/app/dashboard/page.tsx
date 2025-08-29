"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [kpis, setKpis] = useState({
    customers: 0,
    activeTickets: 0,
    aiSuggestions: 0,
    costSaved: 0,
  });
  const [aiList, setAiList] = useState([]);

  useEffect(() => {
    // Get logged-in user
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      setUser(data.session?.user);
    });

    // Fetch KPIs from Supabase
    async function fetchKPIs() {
      const { data: customers } = await supabase.from("customers").select("*");
      const { data: tickets } = await supabase.from("tickets").select("*").eq("status", "active");
      const { data: aiSuggestions } = await supabase.from("ai_suggestions").select("*").eq("status", "pending");
      const { data: costs } = await supabase.from("automation_costs").select("*");

      setKpis({
        customers: customers?.length || 0,
        activeTickets: tickets?.length || 0,
        aiSuggestions: aiSuggestions?.length || 0,
        costSaved: costs?.reduce((sum, c) => sum + c.amount_saved, 0) || 0,
      });

      setAiList(aiSuggestions || []);
    }

    fetchKPIs();
  }, []);

  const implementSuggestion = async (id: string) => {
    await supabase.from("ai_suggestions").update({ status: "implemented" }).eq("id", id);
    setAiList(prev => prev.filter(s => s.id !== id));
  };

  const chartData = [
    { name: "Jan", tickets: 20 },
    { name: "Feb", tickets: 45 },
    { name: "Mar", tickets: 30 },
    { name: "Apr", tickets: 60 },
    { name: "May", tickets: 50 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-900 text-white p-8 pt-32 font-sans">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.email.split("@")[0]}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/60 p-6 rounded-lg shadow-md backdrop-blur-md">
          <h2 className="text-lg font-semibold">Customers</h2>
          <p className="text-2xl mt-2">{kpis.customers}</p>
        </div>
        <div className="bg-black/60 p-6 rounded-lg shadow-md backdrop-blur-md">
          <h2 className="text-lg font-semibold">Active Tickets</h2>
          <p className="text-2xl mt-2">{kpis.activeTickets}</p>
        </div>
        <div className="bg-black/60 p-6 rounded-lg shadow-md backdrop-blur-md">
          <h2 className="text-lg font-semibold">AI Suggestions</h2>
          <p className="text-2xl mt-2">{kpis.aiSuggestions}</p>
        </div>
        <div className="bg-black/60 p-6 rounded-lg shadow-md backdrop-blur-md">
          <h2 className="text-lg font-semibold">Cost Saved ($)</h2>
          <p className="text-2xl mt-2">{kpis.costSaved}</p>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">AI Recommendations</h2>
        <div className="space-y-4">
          {aiList.map((s: any) => (
            <div key={s.id} className="bg-black/50 p-4 rounded-md flex justify-between items-center">
              <span>{s.title}</span>
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 rounded-md"
                onClick={() => implementSuggestion(s.id)}
              >
                Implement
              </button>
            </div>
          ))}
          {aiList.length === 0 && <p className="text-gray-400">No pending AI suggestions.</p>}
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-black/60 p-6 rounded-lg shadow-md backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4">Tickets Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="tickets" stroke="#a855f7" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

