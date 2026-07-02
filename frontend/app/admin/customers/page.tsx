"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => (await api.get(`/users?search=${search}&limit=50`)).data,
  });

  const toggleDisabled = useMutation({
    mutationFn: async ({ id, isDisabled }: { id: string; isDisabled: boolean }) =>
      api.put(`/users/${id}/disable`, { isDisabled }),
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-charcoal">Customers</h1>
        <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="input !w-64" />
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand/50 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.users?.map((u: any) => (
              <tr key={u._id} className="border-t border-charcoal/5">
                <td className="p-4">
                  <Link href={`/admin/customers/${u._id}`} className="text-clay font-medium">{u.name}</Link>
                </td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{formatPrice(u.totalSpending || 0)}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isDisabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.isDisabled ? "Disabled" : "Active"}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleDisabled.mutate({ id: u._id, isDisabled: !u.isDisabled })}
                    className="text-xs text-clay"
                  >
                    {u.isDisabled ? "Enable" : "Disable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
