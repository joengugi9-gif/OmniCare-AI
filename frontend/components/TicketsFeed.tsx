"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Ticket = {
  id: string;
  customer_name: string;
  category: string;
  status: string;
  priority: string;
  message: string;
  created_at: string;
};

export default function TicketsFeed() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets on load
  useEffect(() => {
    fetchTickets();

    // Subscribe to realtime updates
    const subscription = supabase
      .from("tickets")
      .on("*", payload => {
        fetchTickets(); // refresh list on any change
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-bold mb-4">Tickets & Queries</h2>
      {tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Customer</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-b border-gray-800">
                <td className="py-2">{ticket.customer_name}</td>
                <td>{ticket.category}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
