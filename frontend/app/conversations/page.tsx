"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch conversations when page loads
  useEffect(() => {
    const loadConversations = async () => {
      const { data } = await supabase.from("conversations").select("*");
      setConversations(data || []);
    };
    loadConversations();
  }, []);

  // Load messages for a selected conversation
  const loadMessages = async (conversationId: string) => {
    setSelectedConversation(conversationId);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // ✅ Subscribe to new messages in real-time
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // cleanup when switching conversation or leaving page
    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="flex h-screen">
      {/* Left side: conversations list */}
      <div className="w-1/3 border-r bg-gray-50">
        <h2 className="p-4 font-bold">Conversations</h2>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`p-3 cursor-pointer hover:bg-gray-200 ${
                selectedConversation === conv.id ? "bg-gray-300" : ""
              }`}
              onClick={() => loadMessages(conv.id)}
            >
              {conv.customer_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: messages */}
      <div className="flex-1 p-4">
        {selectedConversation ? (
          <div>
            <h3 className="font-semibold mb-2">Messages</h3>
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="p-2 rounded bg-gray-100">
                  <span className="font-semibold">{msg.sender}: </span>
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
}
