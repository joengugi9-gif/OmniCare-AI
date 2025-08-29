"use client";

import Link from "next/link";

export default function PublicNavbar() {
  return (
    <nav className="w-full bg-black/60 text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-purple-400">
        OmniCare AI
      </Link>

      {/* Public Links */}
      <div className="flex space-x-6">
        <Link href="/about" className="hover:text-purple-300 transition">
          About
        </Link>
        <Link
          href="/login"
          className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-400 transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
