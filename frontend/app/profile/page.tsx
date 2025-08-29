"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get current session user
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user;
      if (currentUser) {
        setUser(currentUser);
        setFullName(currentUser.user_metadata?.full_name || "");
        setAvatarUrl(currentUser.user_metadata?.avatar_url || "");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const updates = {
      id: user.id,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
      },
    };

    const { error } = await supabase.auth.update(updates);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <form
        onSubmit={handleUpdate}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Profile</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />

        <input
          type="text"
          placeholder="Avatar URL"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />

        {message && <p className="text-green-400 mb-2">{message}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
