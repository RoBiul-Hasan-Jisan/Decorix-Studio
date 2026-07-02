"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Packed: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { firebaseUser } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await api.get<Order[]>("/orders/mine")).data,
    enabled: !!firebaseUser,
  });

  if (!firebaseUser) return <p className="text-center py-24 text-stone">Please sign in to view your orders.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl text-charcoal mb-8">Order History</h1>
      {isLoading ? (
        <p className="text-stone">Loading orders...</p>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o._id} href={`/orders/${o._id}`} className="block bg-white/60 rounded-xl p-5 hover:shadow-soft transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-charcoal">{o.orderNumber}</p>
                  <p className="text-xs text-stone mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColor[o.status]}`}>{o.status}</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <p className="text-sm text-charcoal/70">{o.items.length} item(s)</p>
                <p className="font-semibold">{formatPrice(o.totalAmount)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone">You haven't placed any orders yet.</p>
      )}
    </div>
  );
}
