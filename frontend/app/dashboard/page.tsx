"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [recentConvos, setRecentConvos] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Conversations today
      const today = new Date().toISOString().split("T")[0];
      const { count: totalConvos } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      // 2. Avg response time (based on messages table)
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, sender, created_at")
        .gte("created_at", today)
        .order("created_at", { ascending: true });

      let responseTimes: number[] = [];
      if (messages) {
        const grouped: { [key: string]: any[] } = {};
        messages.forEach((m) => {
          if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
          grouped[m.conversation_id].push(m);
        });

        for (const convoId in grouped) {
          const msgs = grouped[convoId];
          const customerMsg = msgs.find((m) => m.sender === "customer");
          const agentMsg = msgs.find((m) => m.sender !== "customer");
          if (customerMsg && agentMsg) {
            const diff =
              new Date(agentMsg.created_at).getTime() -
              new Date(customerMsg.created_at).getTime();
            responseTimes.push(diff / 1000); // seconds
          }
        }
      }
      const avgResponse =
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

      // 3. Satisfaction
      const { data: feedback } = await supabase
        .from("feedback")
        .select("rating");
      const satisfaction =
        feedback && feedback.length > 0
          ? feedback.reduce((a, b) => a + b.rating, 0) / feedback.length
          : 0;

      // 4. Recent conversations + latest message snippet
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, customer_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      let convosWithMessages: any[] = [];
      if (convos) {
        for (let convo of convos) {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          convosWithMessages.push({
            ...convo,
            lastMessage: lastMsg?.content || "No messages yet",
          });
        }
      }

      setStats({
        totalConvos,
        avgResponse,
        satisfaction,
        activeChannels: ["WhatsApp", "Email"], // later dynamic
      });
      setRecentConvos(convosWithMessages || []);
    }
    loadData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 text-white p-4 rounded shadow">
          <p className="text-sm text-gray-300">Conversations Today</p>
          <p className="text-2xl font-bold">{stats?.totalConvos || 0}</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow">
          <p className="text-sm text-gray-300">Avg Response Time</p>
          <p className="text-2xl font-bold">{stats?.avgResponse.toFixed(1) || 0}s</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow">
          <p className="text-sm text-gray-300">Satisfaction</p>
          <p className="text-2xl font-bold">{stats?.satisfaction.toFixed(1) || 0}/5</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow">
          <p className="text-sm text-gray-300">Active Channels</p>
          <p className="text-2xl font-bold">{stats?.activeChannels?.length || 0}</p>
        </div>
      </div>

      {/* Recent Conversations */}
      <h3 className="text-lg font-semibold mb-2">Recent Conversations</h3>
      <ul className="bg-gray-800 text-white rounded shadow divide-y divide-gray-700">
        {recentConvos.map((c) => (
          <li key={c.id} className="p-3">
            <div className="flex justify-between">
              <span className="font-semibold">{c.customer_name}</span>
              <span className="text-sm text-gray-400">{c.status}</span>
            </div>
            <p className="text-sm text-gray-300 mt-1 truncate">{c.lastMessage}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
