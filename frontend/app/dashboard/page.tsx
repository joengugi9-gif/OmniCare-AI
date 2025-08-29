"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import TicketsFeed from "@/components/TicketsFeed";

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [aiTasks, setAiTasks] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [ticketsData, setTicketsData] = useState<any[]>([]);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      // ✅ Check session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch data only if logged in
      try {
        // Customers
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
        const totalRevenue = sales?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
        setRevenue(totalRevenue);

        // AI tasks
        const { count: tasksCount } = await supabase
          .from("ai_tasks")
          .select("*", { count: "exact" })
          .eq("status", "completed");
        setAiTasks(tasksCount || 0);

        // Sales chart
        const salesChartData =
          sales?.map((s: any, i: number) => ({ day: `Day ${i + 1}`, amount: s.amount })) || [];
        setSalesData(salesChartData);

        // Tickets chart
        const { data: tickets } = await supabase.from("tickets").select("created_at");
        const ticketsChartData =
          tickets?.map((t: any, i: number) => ({ day: `Day ${i + 1}`, tickets: 1 })) || [];
        setTicketsData(ticketsChartData);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetch();
  }, [router]);

  if (loading) {
    return <div className="text-white p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 pt-24 bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen text-white">
      {/* ... your same dashboard JSX ... */}
      <TicketsFeed />
    </div>
  );
}
