"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FiUsers, FiBox, FiShoppingCart, FiDollarSign, FiClock, FiCheckCircle } from "react-icons/fi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
  });

  if (isLoading || !data) return <p className="text-stone">Loading dashboard...</p>;

  const cards = [
    { label: "Total Users", value: data.totalUsers, icon: FiUsers },
    { label: "Total Products", value: data.totalProducts, icon: FiBox },
    { label: "Total Orders", value: data.totalOrders, icon: FiShoppingCart },
    { label: "Revenue", value: formatPrice(data.revenue), icon: FiDollarSign },
    { label: "Pending Orders", value: data.pendingOrders, icon: FiClock },
    { label: "Delivered Orders", value: data.deliveredOrders, icon: FiCheckCircle },
  ];

  const chartData = data.monthlyRevenue.map((m: any) => ({
    name: `${MONTHS[m._id.month - 1]}`,
    revenue: m.revenue,
    orders: m.orders,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-soft">
            <Icon className="text-clay mb-3" size={20} />
            <p className="text-2xl font-display">{value}</p>
            <p className="text-xs text-stone mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h3 className="font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22201C10" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#B5652E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h3 className="font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p._id} className="flex justify-between items-center text-sm border-b border-charcoal/5 pb-2 last:border-0">
                <span>{i + 1}. {p.name}</span>
                <span className="text-stone">{p.totalSold} sold · {formatPrice(p.revenue)}</span>
              </div>
            ))}
            {data.topProducts.length === 0 && <p className="text-sm text-stone">No sales data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
