"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category } from "@/lib/types";
import { imageUrl } from "@/lib/utils";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await api.get<Category[]>("/categories?all=true")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post("/categories", { name, description }),
    onSuccess: () => {
      toast.success("Category created");
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
      setName(""); setDescription("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create category"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Categories</h1>

      <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
        <h2 className="font-semibold mb-4">Add New Category</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input placeholder="Category Name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
        </div>
        <button onClick={() => name && createMutation.mutate()} className="btn-primary !py-2 !px-5 text-xs flex items-center gap-2">
          <FiPlus size={14} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories?.map((c) => (
          <div key={c._id} className="bg-white rounded-xl p-4 shadow-soft text-center">
            <div className="w-16 h-16 rounded-full bg-sand mx-auto mb-3 overflow-hidden">
              {c.icon && <img src={imageUrl(c.icon)} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <p className="font-medium text-sm">{c.name}</p>
            <button onClick={() => deleteMutation.mutate(c._id)} className="text-red-500 mt-2">
              <FiTrash2 size={14} className="mx-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
