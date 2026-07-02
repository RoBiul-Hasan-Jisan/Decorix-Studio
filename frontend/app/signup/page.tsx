"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") || "Google sign-in failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-3xl text-charcoal mb-2">Create Account</h1>
      <p className="text-stone mb-8 text-sm">Join us for a better shopping experience.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating account..." : "Sign Up"}</button>
      </form>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-charcoal/10" /><span className="text-xs text-stone">OR</span><div className="flex-1 h-px bg-charcoal/10" />
      </div>
      <button onClick={handleGoogle} className="btn-outline w-full flex items-center justify-center gap-3">
        <FcGoogle size={18} /> Continue with Google
      </button>
      <p className="text-center text-sm text-stone mt-8">
        Already have an account? <Link href="/login" className="text-clay font-medium">Sign in</Link>
      </p>
    </div>
  );
}
