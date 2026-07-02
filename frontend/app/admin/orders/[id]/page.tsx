"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => api.put(`/orders/${id}/status`, { status, note }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      setNote("");
    },
  });

  if (isLoading || !order) return <p className="text-stone">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-charcoal mb-1">{order.orderNumber}</h1>
      <p className="text-sm text-stone mb-8">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <h3 className="font-semibold mb-3 text-sm">Customer</h3>
          <p className="text-sm">{order.user?.name}</p>
          <p className="text-sm text-stone">{order.user?.email}</p>
          <p className="text-sm text-stone">{order.shipping.phone}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <h3 className="font-semibold mb-3 text-sm">Shipping Address</h3>
          <p className="text-sm text-stone">
            {order.shipping.completeAddress}, {order.shipping.city} {order.shipping.postalCode}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-soft mb-8">
        <h3 className="font-semibold mb-3 text-sm">Items</h3>
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b border-charcoal/5 last:border-0">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-3 mt-2 border-t border-charcoal/10">
          <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-soft">
        <h3 className="font-semibold mb-3 text-sm">Update Status</h3>
        <p className="text-xs text-stone mb-3">Current: <span className="font-medium text-charcoal">{order.status}</span></p>
        <input placeholder="Optional note for customer" value={note} onChange={(e) => setNote(e.target.value)} className="input mb-3" />
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus.mutate(s)}
              disabled={s === order.status}
              className={`text-xs px-4 py-2 rounded-full border ${s === order.status ? "bg-charcoal text-cream border-charcoal" : "border-charcoal/20 hover:border-charcoal"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
