"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login"); // redirect if not logged in
      } else {
        setLoading(false); // user is logged in
      }
    });
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
