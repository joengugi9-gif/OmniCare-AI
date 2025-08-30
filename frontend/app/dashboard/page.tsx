"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [recentConvos, setRecentConvos] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Conversations today
      const { count: totalConvos } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]); // today

      // 2. Avg response time (we’ll improve later)
      // For now: just a placeholder
      const avgResponse = 10;

      // 3. Satisfaction
      const { data: feedback } = await supabase
        .from("feedback")
        .select("rating");
      const satisfaction =
        feedback && feedback.length > 0
          ? feedback.reduce((a, b) => a + b.rating, 0) / feedback.length
          : 0;

      // 4. Recent conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalConvos,
        avgResponse,
        satisfaction,
        activeChannels: ["WhatsApp", "Email"], // later dynamic
      });
      setRecentConvos(convos || []);
    }
    loadData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Conversations Today</p>
          <p className="text-2xl font-bold">{stats?.totalConvos || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Avg Response Time</p>
          <p className="text-2xl font-bold">{stats?.avgResponse || 0}s</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Satisfaction</p>
          <p className="text-2xl font-bold">{stats?.satisfaction.toFixed(1) || 0}/5</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Active Channels</p>
          <p className="text-2xl font-bold">{stats?.activeChannels?.length || 0}</p>
        </div>
      </div>

      {/* Recent Conversations */}
      <h3 className="text-lg font-semibold mb-2">Recent Conversations</h3>
      <ul className="bg-white rounded shadow divide-y">
        {recentConvos.map((c) => (
          <li key={c.id} className="p-3 flex justify-between">
            <span>{c.customer_name}</span>
            <span className="text-sm text-gray-500">{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
