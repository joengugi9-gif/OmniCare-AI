"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
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
  const [openTickets, setOpenTickets] = useState(0);
  const [ticketsData, setTicketsData] = useState<any[]>([]);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      // ✅ Check session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        // Open tickets count
        const { count: ticketsCount } = await supabase
          .from("tickets")
          .select("*", { count: "exact" })
          .eq("status", "open");
        setOpenTickets(ticketsCount || 0);

        // Tickets chart
        const { data: tickets } = await supabase.from("tickets").select("created_at");
        const ticketsChartData =
          tickets?.map((t: any, i: number) => ({
            day: `Day ${i + 1}`,
            tickets: 1,
          })) || [];
        setTicketsData(ticketsChartData);
      } catch (err) {
        console.error("Error fetching tickets:", err);
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
      <h1 className="text-3xl font-bold mb-6">Tickets Dashboard</h1>

      {/* KPI */}
      <div className="flex gap-4 mb-8">
        <KpiCard title="Open Tickets" value={openTickets} icon="🎫" />
      </div>

      {/* Tickets Chart */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Tickets Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ticketsData}>
            <XAxis dataKey="day" stroke="#aaa" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tickets" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tickets Feed */}
      <TicketsFeed />
    </div>
  );
}
