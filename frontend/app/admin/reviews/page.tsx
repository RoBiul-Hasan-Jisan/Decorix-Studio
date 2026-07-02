"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { FiStar, FiTrash2, FiEyeOff, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => (await api.get("/reviews")).data,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => api.put(`/reviews/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => { toast.success("Review deleted"); queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }); },
  });

  const reply = useMutation({
    mutationFn: async (id: string) => api.put(`/reviews/${id}/reply`, { adminReply: replyDrafts[id] }),
    onSuccess: () => { toast.success("Reply posted"); queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }); },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Reviews</h1>
      <div className="space-y-4">
        {reviews?.map((r: any) => (
          <div key={r._id} className="bg-white rounded-xl p-5 shadow-soft">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm">{r.user?.name} on <span className="text-clay">{r.product?.name}</span></p>
                <div className="flex text-clay my-1">
                  {Array.from({ length: 5 }).map((_, i) => <FiStar key={i} className={i < r.rating ? "fill-clay" : ""} size={12} />)}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "hidden" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {r.status}
              </span>
            </div>
            <p className="text-sm text-charcoal/70 mb-3">{r.comment}</p>
            <div className="flex gap-3 mb-3 text-xs">
              {r.status !== "approved" && (
                <button onClick={() => setStatus.mutate({ id: r._id, status: "approved" })} className="flex items-center gap-1 text-green-700"><FiCheck size={12} /> Approve</button>
              )}
              {r.status !== "hidden" && (
                <button onClick={() => setStatus.mutate({ id: r._id, status: "hidden" })} className="flex items-center gap-1 text-stone"><FiEyeOff size={12} /> Hide</button>
              )}
              <button onClick={() => deleteReview.mutate(r._id)} className="flex items-center gap-1 text-red-500"><FiTrash2 size={12} /> Delete</button>
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Reply to this review..."
                defaultValue={r.adminReply}
                onChange={(e) => setReplyDrafts((d) => ({ ...d, [r._id]: e.target.value }))}
                className="input !py-2 flex-1"
              />
              <button onClick={() => reply.mutate(r._id)} className="btn-outline !py-2 !px-4 text-xs">Reply</button>
            </div>
          </div>
        ))}
        {reviews?.length === 0 && <p className="text-stone">No reviews yet.</p>}
      </div>
    </div>
  );
}
