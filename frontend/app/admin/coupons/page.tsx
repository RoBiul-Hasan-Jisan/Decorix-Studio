"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const emptyForm = { code: "", discountPercent: "", minPurchase: "0", maxDiscount: "", expiresAt: "" };

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: coupons } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await api.get("/coupons")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post("/coupons", form),
    onSuccess: () => {
      toast.success("Coupon created");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Coupons</h1>

      <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
        <h2 className="font-semibold mb-4">Create Coupon</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <input placeholder="Code (e.g. SAVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" />
          <input type="number" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className="input" />
          <input type="number" placeholder="Min Purchase" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} className="input" />
          <input type="number" placeholder="Max Discount (optional)" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input" />
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input" />
        </div>
        <button onClick={() => form.code && form.discountPercent && form.expiresAt && createMutation.mutate()} className="btn-primary !py-2 !px-5 text-xs flex items-center gap-2">
          <FiPlus size={14} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand/50 text-left">
            <tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Expires</th><th className="p-4">Used</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {coupons?.map((c: any) => (
              <tr key={c._id} className="border-t border-charcoal/5">
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4">{c.discountPercent}%</td>
                <td className="p-4">{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td className="p-4">{c.usageCount}</td>
                <td className="p-4"><button onClick={() => deleteMutation.mutate(c._id)} className="text-red-500"><FiTrash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
