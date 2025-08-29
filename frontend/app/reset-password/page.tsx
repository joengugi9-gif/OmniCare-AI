"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email to reset your password!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        onSubmit={handleReset}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Reset Password</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
          required
        />

        {message && <p className="text-green-400 mb-2">{message}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
        >
          Send Reset Email
        </button>
      </form>
    </div>
  );
}
