"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { imageUrl } from "@/lib/utils";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", subtitle: "", ctaText: "", ctaLink: "" });
  const [file, setFile] = useState<File | null>(null);

  const { data: banners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await api.get("/banners/all")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      return api.post("/banners", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Banner created");
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      setForm({ title: "", subtitle: "", ctaText: "", ctaLink: "" });
      setFile(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create banner"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/banners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Homepage Banners</h1>

      <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
        <h2 className="font-semibold mb-4">Upload New Banner</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" />
          <input placeholder="CTA Text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="input" />
          <input placeholder="CTA Link (e.g. /products)" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="input" />
        </div>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input mb-3" />
        <button onClick={() => file && createMutation.mutate()} className="btn-primary !py-2 !px-5 text-xs flex items-center gap-2">
          <FiPlus size={14} /> Upload Banner
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {banners?.map((b: any) => (
          <div key={b._id} className="bg-white rounded-xl shadow-soft overflow-hidden">
            <img src={imageUrl(b.image)} alt={b.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{b.title}</p>
                <p className="text-xs text-stone">{b.subtitle}</p>
              </div>
              <button onClick={() => deleteMutation.mutate(b._id)} className="text-red-500"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
