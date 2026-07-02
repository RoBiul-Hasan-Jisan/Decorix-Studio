"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { user, firebaseUser, loading, isAdmin, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [addrForm, setAddrForm] = useState({ label: "Home", fullName: "", phone: "", city: "", area: "", postalCode: "", completeAddress: "", isDefault: false });
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  if (loading) {
    return <p className="text-center py-24 text-stone">Loading your account...</p>;
  }

  if (!firebaseUser) {
    return (
      <div className="text-center py-24 text-stone">
        <p className="mb-4">Please sign in to view your profile.</p>
        <Link href="/login?redirect=/profile" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (isAdmin) {
    return <p className="text-center py-24 text-stone">Redirecting to your admin dashboard...</p>;
  }

  if (!user) {
    return (
      <div className="text-center py-24 text-stone">
        <p className="mb-4">Couldn't load your profile.</p>
        <button
          onClick={async () => {
            setRetrying(true);
            await refreshUser();
            setRetrying(false);
          }}
          disabled={retrying}
          className="btn-outline"
        >
          {retrying ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  const saveProfile = async () => {
    await api.put("/users/profile", form);
    await refreshUser();
    toast.success("Profile updated");
  };

  const addAddress = async () => {
    await api.post("/users/addresses", addrForm);
    await refreshUser();
    toast.success("Address added");
    setAddrForm({ label: "Home", fullName: "", phone: "", city: "", area: "", postalCode: "", completeAddress: "", isDefault: false });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-charcoal">My Account</h1>
        <button onClick={logout} className="text-sm text-clay">Logout</button>
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/profile" className="font-semibold text-clay">Profile</Link>
        <Link href="/orders" className="text-charcoal/70">Order History</Link>
        <Link href="/wishlist" className="text-charcoal/70">Wishlist</Link>
      </div>

      <section className="bg-white/60 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Edit Information</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input" />
        </div>
        <input value={user.email} disabled className="input opacity-60 mb-4" />
        <button onClick={saveProfile} className="btn-primary !py-2 !px-5 text-xs">Save Changes</button>
      </section>

      <section className="bg-white/60 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Saved Addresses</h2>
        <div className="space-y-3 mb-6">
          {user.addresses?.map((a: any) => (
            <div key={a._id} className="border border-charcoal/10 rounded-lg p-3 text-sm">
              <p className="font-medium">{a.label} {a.isDefault && <span className="text-xs text-clay">(Default)</span>}</p>
              <p className="text-charcoal/70">{a.fullName}, {a.completeAddress}, {a.city} {a.postalCode}</p>
            </div>
          ))}
          {(!user.addresses || user.addresses.length === 0) && <p className="text-sm text-stone">No saved addresses yet.</p>}
        </div>
        <h3 className="font-medium text-sm mb-3">Add New Address</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input placeholder="Full Name" value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} className="input" />
          <input placeholder="Phone" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className="input" />
          <input placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className="input" />
          <input placeholder="Postal Code" value={addrForm.postalCode} onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })} className="input" />
        </div>
        <textarea placeholder="Complete Address" value={addrForm.completeAddress} onChange={(e) => setAddrForm({ ...addrForm, completeAddress: e.target.value })} className="input mb-3" rows={2} />
        <button onClick={addAddress} className="btn-outline !py-2 !px-5 text-xs">Add Address</button>
      </section>
    </div>
  );
}
