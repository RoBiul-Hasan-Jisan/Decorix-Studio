"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
  });

  if (isLoading || !data) return <p className="text-stone">Loading...</p>;
  const { user, orders } = data;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-charcoal mb-1">{user.name}</h1>
      <p className="text-stone text-sm mb-8">{user.email} · {user.phone || "No phone"}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-soft text-center">
          <p className="font-display text-xl">{orders.length}</p>
          <p className="text-xs text-stone">Orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft text-center">
          <p className="font-display text-xl">{formatPrice(user.totalSpending || 0)}</p>
          <p className="text-xs text-stone">Total Spent</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft text-center">
          <p className="font-display text-xl">{user.addresses?.length || 0}</p>
          <p className="text-xs text-stone">Saved Addresses</p>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Order History</h2>
      <div className="bg-white rounded-xl shadow-soft divide-y divide-charcoal/5">
        {orders.map((o: any) => (
          <div key={o._id} className="p-4 flex justify-between text-sm">
            <span>{o.orderNumber}</span>
            <span className="text-stone">{o.status}</span>
            <span>{formatPrice(o.totalAmount)}</span>
          </div>
        ))}
        {orders.length === 0 && <p className="p-4 text-sm text-stone">No orders yet.</p>}
      </div>
    </div>
  );
}
