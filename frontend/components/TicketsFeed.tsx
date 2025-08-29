"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import TicketsFeed from "@/components/TicketsFeed"; // <-- import the real-time tickets component

// Reusable KPI card component
function KpiCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center w-40 shadow-lg">
      <div className="text-purple-400 text-3xl mb-2">{icon}</div>
      <div className="text-white font-semibold text-lg">{title}</div>
      <div className="text-white font-bold text-xl">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [aiTasks, setAiTasks] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [ticketsData, setTicketsData] = useState<any[]>([]);

  // Fetch dashboard data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Customers count
      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact" });
      setCustomers(customerCount || 0);

      // Open tickets
      const { count: ticketsCount } = await supabase
        .from("tickets")
        .select("*", { count: "exact" })
        .eq("status", "open");
      setOpenTickets(ticketsCount || 0);

      // Revenue
      const { data: sales } = await supabase.from("sales").select("amount");
      const totalRevenue = sales?.reduce((sum, s) => sum + s.amount, 0) || 0;
      setRevenue(totalRevenue);

      // AI tasks completed
      const { count: tasksCount } = await supabase
        .from("ai_tasks")
        .select("*", { count: "exact" })
        .eq("status", "completed");
      setAiTasks(tasksCount || 0);

      // Prepare sales chart data
      const salesChartData = sales?.map((s: any, i: number) => ({
        day: `Day ${i + 1}`,
        amount: s.amount,
      })) || [];
      setSalesData(salesChartData);

      // Prepare tickets chart data
      const { data: tickets } = await supabase.from("tickets").select("created_at");
      const ticketsChartData = tickets?.map((t: any, i: number) => ({
        day: `Day ${i + 1}`,
        tickets: 1,
      })) || [];
      setTicketsData(ticketsChartData);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 pt-24 bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen text-white">
      {/* KPI Cards */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <KpiCard title="Customers" value={customers} icon="👥" />
        <KpiCard title="Open Tickets" value={openTickets} icon="📩" />
        <KpiCard title="Revenue" value={revenue} icon="💰" />
        <KpiCard title="AI Tasks Done" value={aiTasks} icon="🤖" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg">
          <h2 className="text-purple-400 font-semibold mb-2">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <XAxis dataKey="day" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#9f7aea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets Chart */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg">
          <h2 className="text-purple-400 font-semibold mb-2">Tickets Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketsData}>
              <XAxis dataKey="day" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
              <Bar dataKey="tickets" fill="#9f7aea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg mb-8">
        <h2 className="text-purple-400 font-semibold mb-2">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition">
            Auto-email Reply
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition">
            Schedule Social Post
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition">
            Assign Task
          </button>
        </div>
      </div>

      {/* Real-time Tickets Feed */}
      <TicketsFeed />
    </div>
  );
}
