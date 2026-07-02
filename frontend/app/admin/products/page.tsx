"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product, Category } from "@/lib/types";
import { imageUrl, formatPrice } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", description: "", category: "", brand: "", material: "", color: "",
  size: "", dimensions: "", weight: "", price: "", discountPercent: "0", stock: "",
  isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: true,
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [files, setFiles] = useState<FileList | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await api.get<{ products: Product[] }>("/products?limit=100")).data.products,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await api.get<Category[]>("/categories?all=true")).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (files) Array.from(files).forEach((f) => fd.append("images", f));
      if (editingId) return api.put(`/products/${editingId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      resetForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFiles(null);
    setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description,
      category: typeof p.category === "object" ? p.category._id : p.category,
      brand: p.brand || "", material: p.material || "", color: (p.color || []).join(","),
      size: p.size || "", dimensions: p.dimensions || "", weight: p.weight || "",
      price: p.price, discountPercent: p.discountPercent, stock: p.stock,
      isFeatured: p.isFeatured, isTrending: p.isTrending, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-charcoal">Products</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 !py-2.5">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-cream rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={resetForm}><FiX /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                <option value="">Select Category</option>
                {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
                <input placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input" />
                <input placeholder="Colors (comma separated)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input" />
                <input placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="input" />
                <input placeholder="Dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="input" />
                <input placeholder="Weight" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input" />
                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
                <input type="number" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} className="input" />
                <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
              </div>
              <div>
                <label className="text-xs text-stone">Product Images (first = thumbnail)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="input" />
              </div>
              <div className="flex flex-wrap gap-4 text-sm pt-2">
                {["isFeatured", "isTrending", "isBestSeller", "isNewArrival"].map((flag) => (
                  <label key={flag} className="flex items-center gap-2">
                    <input type="checkbox" checked={form[flag]} onChange={(e) => setForm({ ...form, [flag]: e.target.checked })} />
                    {flag.replace("is", "")}
                  </label>
                ))}
              </div>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.name || !form.category || !form.price}
                className="btn-primary w-full"
              >
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand/50 text-left">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p._id} className="border-t border-charcoal/5">
                <td className="p-4 flex items-center gap-3">
                  <img src={imageUrl(p.thumbnail)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  {p.name}
                </td>
                <td className="p-4">{typeof p.category === "object" ? p.category.name : ""}</td>
                <td className="p-4">{formatPrice(p.finalPrice)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => startEdit(p)} className="text-clay"><FiEdit2 size={15} /></button>
                  <button onClick={() => deleteMutation.mutate(p._id)} className="text-red-500"><FiTrash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
