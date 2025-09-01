"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

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

  // ✅ AI reply integration
  const sendMessage = async (content: string) => {
    if (!selectedConversation) return;

    // Save customer message first
    await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender: "customer",
      message: content,
    });

    // Call AI function
    const res = await fetch("/functions/v1/ai-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    });
    const data = await res.json();

    // Save AI reply
    await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender: "ai",
      message: data.reply,
    });

    setNewMessage("");
  };

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
                      : msg.sender === "ai"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="font-semibold text-sm text-purple-200 mb-1 capitalize">{msg.sender}</p>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Input box */}
            <div className="mt-4 flex">
              <input
                type="text"
                className="flex-1 p-2 rounded-l bg-gray-800 border border-gray-700 text-white"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(newMessage)}
              />
              <button
                onClick={() => sendMessage(newMessage)}
                className="bg-purple-600 p-2 rounded-r hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400">Select a conversation to view messages.</p>
        )}
      </div>
    </div>
  );
}
