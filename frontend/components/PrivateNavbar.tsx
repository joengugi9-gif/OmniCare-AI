"use client";

import Link from "next/link";

export default function PrivateNavbar() {
  return (
    <nav className="w-full bg-black/60 text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md">
      {/* Logo */}
      <Link href="/dashboard" className="text-2xl font-bold text-purple-400">
        OmniCare AI
      </Link>

      {/* Private Links */}
      <div className="flex space-x-6">
        <Link href="/dashboard" className="hover:text-purple-300 transition">
          Dashboard
        </Link>
        <Link href="/chat" className="hover:text-purple-300 transition">
          Chat
        </Link>
        <Link href="/about" className="hover:text-purple-300 transition">
          About
        </Link>
        <Link
          href="/logout"
          className="text-red-400 hover:text-red-300 transition"
        >
          Logout
        </Link>
      </div>
    </nav>
  );
}
