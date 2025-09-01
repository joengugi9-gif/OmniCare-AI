"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      const { data, error } = await supabase.from("conversations").select("*");
      if (error) console.error(error);
      else setConversations(data);
    };
    loadConversations();
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });
      if (error) console.error(error);
      else setMessages(data);
    };
    loadMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar: Conversations */}
      <div className="w-1/4 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Conversations</h2>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 mb-2 rounded cursor-pointer ${
                selectedConversation?.id === conv.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <span className="font-medium text-purple-300">{conv.customer_name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col p-4">
        {selectedConversation ? (
          <>
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              {selectedConversation.customer_name}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-md ${
                    msg.sender === "agent"
                      ? "bg-purple-600 text-white self-end ml-auto"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="font-semibold text-sm text-purple-200 mb-1">{msg.sender}</p>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400">Select a conversation to view messages.</p>
        )}
      </div>
    </div>
  );
}
