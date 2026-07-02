"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: async () => (await api.get(`/orders?${status ? `status=${status}&` : ""}limit=50`)).data,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-charcoal">Orders</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand/50 text-left">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.orders?.map((o: any) => (
              <tr key={o._id} className="border-t border-charcoal/5 hover:bg-sand/20">
                <td className="p-4">
                  <Link href={`/admin/orders/${o._id}`} className="text-clay font-medium">{o.orderNumber}</Link>
                </td>
                <td className="p-4">{o.user?.name}</td>
                <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4">{formatPrice(o.totalAmount)}</td>
                <td className="p-4">
                  <span className="text-xs bg-sand px-3 py-1 rounded-full">{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
