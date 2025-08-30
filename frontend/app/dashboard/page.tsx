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

      // 2. Avg response time (placeholder for now)
      const avgResponse = 10;

      // 3. Satisfaction rating
      const { data: feedback } = await supabase.from("feedback").select("rating");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Conversations Today</p>
          <p className="text-3xl font-bold text-indigo-600">{stats?.totalConvos || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Response Time</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.avgResponse || 0}s</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Satisfaction</p>
          <p className="text-3xl font-bold text-yellow-500">
            {stats?.satisfaction?.toFixed(1) || 0}/5
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Active Channels</p>
          <p className="text-3xl font-bold text-green-600">
            {stats?.activeChannels?.length || 0}
          </p>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Conversations
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentConvos.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 text-gray-800">{c.customer_name}</td>
                <td
                  className={`py-3 font-medium ${
                    c.status === "Resolved"
                      ? "text-green-600"
                      : c.status === "Pending"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {c.status}
                </td>
                <td className="py-3 text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
