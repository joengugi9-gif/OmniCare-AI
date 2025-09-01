"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
};

type Message = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Load conversations
  useEffect(() => {
    async function loadConvos() {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setConversations(data || []);
    }
    loadConvos();
  }, []);

  // Load + subscribe to messages
  useEffect(() => {
    if (!selectedConvo) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConvo.id)
        .order("created_at", { ascending: true });
      if (error) console.error(error);
      else setMessages(data || []);
    }
    loadMessages();

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvo.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvo]);

  // Send message
  async function sendMessage() {
    if (!newMessage.trim() || !selectedConvo) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConvo.id,
      sender: "agent", // later you can replace with logged-in user
      content: newMessage,
    });
    if (error) console.error(error);
    setNewMessage("");
  }

  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-1/3 bg-gray-900 text-white p-4 border-r border-gray-700">
        <h2 className="text-lg font-bold mb-4">Conversations</h2>
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li
              key={c.id}
              onClick={() => setSelectedConvo(c)}
              className={`p-2 rounded cursor-pointer ${
                selectedConvo?.id === c.id ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <p className="font-semibold">{c.customer_name}</p>
              <p className="text-xs text-gray-400">{c.status}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-800 text-white">
        {selectedConvo ? (
          <>
            <div className="p-4 border-b border-gray-700 font-bold">
              Chat with {selectedConvo.customer_name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded max-w-xs ${
                    m.sender === "agent"
                      ? "bg-blue-600 ml-auto"
                      : "bg-gray-600 mr-auto"
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-900 text-white"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
