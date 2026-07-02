"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import { imageUrl, formatPrice } from "@/lib/utils";
import { FiCheck } from "react-icons/fi";

const STAGES = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
  });

  if (isLoading) return <p className="text-center py-24 text-stone">Loading...</p>;
  if (!order) return <p className="text-center py-24 text-stone">Order not found.</p>;

  const currentStageIndex = STAGES.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl text-charcoal">{order.orderNumber}</h1>
          <p className="text-sm text-stone">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${isCancelled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {order.status}
        </span>
      </div>

      {!isCancelled && (
        <div className="bg-white/60 rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-6">Order Tracking</h2>
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-charcoal/10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-clay transition-all"
              style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
            {STAGES.map((stage, i) => (
              <div key={stage} className="relative flex flex-col items-center z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${i <= currentStageIndex ? "bg-clay text-white" : "bg-white border border-charcoal/15 text-stone"}`}>
                  {i <= currentStageIndex ? <FiCheck size={14} /> : i + 1}
                </div>
                <span className="text-[10px] text-center mt-2 text-charcoal/70 max-w-[70px]">{stage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/60 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Status History</h2>
        <div className="space-y-3">
          {order.statusHistory?.slice().reverse().map((h: any, i: number) => (
            <div key={i} className="flex justify-between text-sm border-b border-charcoal/5 pb-2 last:border-0">
              <span className="font-medium">{h.status}</span>
              <span className="text-stone">{new Date(h.date).toLocaleString()} · {h.updatedBy}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/60 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                <Image src={imageUrl(item.image)} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-stone">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="font-medium text-sm">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-charcoal/10 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatPrice(order.subTotal)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{formatPrice(order.deliveryCharge)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-clay"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between font-semibold pt-2 border-t border-charcoal/10 mt-2"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>

      <div className="bg-white/60 rounded-xl p-6">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p className="text-sm text-charcoal/70">
          {order.shipping.fullName} · {order.shipping.phone}<br />
          {order.shipping.completeAddress}, {order.shipping.city} {order.shipping.postalCode}
        </p>
      </div>
    </div>
  );
}
