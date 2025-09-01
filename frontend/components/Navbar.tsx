"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="w-full bg-black/60 text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 z-50 backdrop-blur-md">
      <Link href="/" className="text-2xl font-bold text-purple-400">
        OmniCare AI
      </Link>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Avatar */}
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}

            {/* Name or email */}
            <span className="text-purple-300 font-semibold">
              {user.user_metadata?.full_name || user.email.split("@")[0]}
            </span>

            {/* Main navigation */}
            <Link href="/dashboard" className="hover:text-purple-300 transition">
              Dashboard
            </Link>
            <Link href="/conversations" className="hover:text-purple-300 transition">
              Conversations
            </Link>
            <Link href="/profile" className="hover:text-purple-300 transition">
              Profile
            </Link>
            <Link href="/chat" className="hover:text-purple-300 transition">
              Chat
            </Link>

            {/* Logout */}
            <button onClick={handleLogout} className="hover:text-red-400 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-purple-300 transition">
              Login
            </Link>
            <Link href="/signup" className="hover:text-purple-300 transition">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
