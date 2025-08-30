"use client";

import { useState } from "react";
import { BarChart3, MessageSquare, BookOpen, Settings, Plug, Home } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: <Home size={20} />, id: "dashboard" },
  { name: "Conversations", icon: <MessageSquare size={20} />, id: "conversations" },
  { name: "Knowledge Base", icon: <BookOpen size={20} />, id: "knowledge" },
  { name: "Analytics", icon: <BarChart3 size={20} />, id: "analytics" },
  { name: "Integrations", icon: <Plug size={20} />, id: "integrations" },
  { name: "Settings", icon: <Settings size={20} />, id: "settings" },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 font-bold text-xl text-blue-600 border-b">
          Omnicare AI
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-left hover:bg-blue-50 ${
                activePage === item.id ? "bg-blue-100 text-blue-600" : "text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold capitalize">{activePage}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hello, Admin</span>
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === "dashboard" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              {/* Here we’ll place Quick Stats, Recent Conversations, AI Performance chart */}
              <p className="text-gray-500">Dashboard Overview content goes here...</p>
            </div>
          )}

          {activePage === "conversations" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Conversations</h2>
              <p className="text-gray-500">Live chat management will go here...</p>
            </div>
          )}

          {activePage === "knowledge" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Knowledge Base</h2>
              <p className="text-gray-500">Knowledge articles & training content...</p>
            </div>
          )}

          {activePage === "analytics" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Analytics</h2>
              <p className="text-gray-500">Charts & insights go here...</p>
            </div>
          )}

          {activePage === "integrations" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Integrations</h2>
              <p className="text-gray-500">Connect WhatsApp, Instagram, Email, etc...</p>
            </div>
          )}

          {activePage === "settings" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p className="text-gray-500">Company branding, AI personality, user management...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
