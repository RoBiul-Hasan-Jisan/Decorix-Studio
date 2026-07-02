"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const { data: contacts } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => (await api.get("/contact")).data,
  });

  const resolve = useMutation({
    mutationFn: async (id: string) => api.put(`/contact/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Contact Messages</h1>
      <div className="space-y-4">
        {contacts?.map((c: any) => (
          <div key={c._id} className="bg-white rounded-xl p-5 shadow-soft">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm">{c.name} · {c.email}</p>
                <p className="text-xs text-stone">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              {c.isResolved ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Resolved</span>
              ) : (
                <button onClick={() => resolve.mutate(c._id)} className="text-xs text-clay">Mark Resolved</button>
              )}
            </div>
            <p className="text-sm font-medium mt-2">{c.subject}</p>
            <p className="text-sm text-charcoal/70 mt-1">{c.message}</p>
          </div>
        ))}
        {contacts?.length === 0 && <p className="text-stone">No messages yet.</p>}
      </div>
    </div>
  );
}
