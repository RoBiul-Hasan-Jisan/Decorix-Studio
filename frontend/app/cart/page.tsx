"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { imageUrl, formatPrice } from "@/lib/utils";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <p className="text-stone mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl text-charcoal mb-8">Shopping Cart</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 bg-white/60 rounded-xl p-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-sand flex-shrink-0">
                <Image src={imageUrl(item.image)} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-charcoal">{item.name}</h3>
                <p className="text-sm text-stone mt-1">{formatPrice(item.price)} each</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-charcoal/15 rounded-full">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2"><FiMinus size={12} /></button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2"><FiPlus size={12} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-stone hover:text-clay">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold text-charcoal">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 rounded-xl p-6 h-fit sticky top-24">
          <h3 className="font-display text-xl mb-4">Order Summary</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Subtotal</span>
            <span>{formatPrice(subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-stone">Estimated Delivery</span>
            <span>৳ 120</span>
          </div>
          <div className="border-t border-charcoal/10 pt-4 flex justify-between font-semibold mb-6">
            <span>Estimated Total</span>
            <span>{formatPrice(subTotal + 60)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
