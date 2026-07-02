"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  area: string;
  postalCode: string;
  completeAddress: string;
}

export default function CheckoutPage() {
  const { items, subTotal, clearCart } = useCart();
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [orderNotes, setOrderNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    defaultValues: { email: user?.email, fullName: user?.name, country: "USA" },
  });

  useEffect(() => {
    if (!loading && !firebaseUser) {
      toast.error("Please sign in to checkout");
      router.push("/login?redirect=/checkout");
    }
  }, [loading, firebaseUser, router]);

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/coupons/validate", { code: couponCode, subTotal });
      setDiscount(data.discount);
      toast.success(`Coupon applied: -${formatPrice(data.discount)}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid coupon");
      setDiscount(0);
    }
  };

  const onSubmit = async (shipping: ShippingForm) => {
    if (items.length === 0) return toast.error("Your cart is empty");
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping,
        orderNotes,
        couponCode: couponCode || undefined,
      });
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/${data._id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const total = subTotal + 60 - discount;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl text-charcoal mb-8">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-2">Shipping Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register("fullName", { required: true })} placeholder="Full Name" className="input" />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <input {...register("phone", { required: true })} placeholder="Phone" className="input" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
          </div>
          <input {...register("email", { required: true })} placeholder="Email" className="input" />
          <div className="grid grid-cols-2 gap-4">
            <input {...register("country")} placeholder="Country" className="input" />
            <input {...register("city", { required: true })} placeholder="City" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input {...register("area")} placeholder="Area" className="input" />
            <input {...register("postalCode")} placeholder="Postal Code" className="input" />
          </div>
          <textarea {...register("completeAddress", { required: true })} placeholder="Complete Address" className="input" rows={3} />
          <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Order Notes (optional)" className="input" rows={2} />

          <h2 className="font-semibold text-lg pt-4">Payment Method</h2>
          <div className="bg-white/60 rounded-lg p-4 text-sm">
            💵 Cash on Delivery — Pay when your order arrives.
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-6 h-fit sticky top-24">
          <h3 className="font-display text-xl mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto text-sm">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between">
                <span className="text-charcoal/70">{i.name} × {i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="input flex-1 !py-2" />
            <button type="button" onClick={applyCoupon} className="btn-outline !py-2 !px-4 text-xs">Apply</button>
          </div>
          <div className="flex justify-between text-sm mb-1"><span className="text-stone">Subtotal</span><span>{formatPrice(subTotal)}</span></div>
          <div className="flex justify-between text-sm mb-1"><span className="text-stone">Delivery</span><span>$60.00</span></div>
          {discount > 0 && <div className="flex justify-between text-sm mb-1 text-clay"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
          <div className="border-t border-charcoal/10 pt-3 mt-3 flex justify-between font-semibold mb-6">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Placing Order..." : "Confirm Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
