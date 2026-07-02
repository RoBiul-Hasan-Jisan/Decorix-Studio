"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

function LoginInner() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") || "Google sign-in failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-3xl text-charcoal mb-2">Welcome Back</h1>
      <p className="text-stone mb-8 text-sm">Sign in to continue shopping.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-clay hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign In"}</button>
      </form>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-charcoal/10" /><span className="text-xs text-stone">OR</span><div className="flex-1 h-px bg-charcoal/10" />
      </div>
      <button onClick={handleGoogle} className="btn-outline w-full flex items-center justify-center gap-3">
        <FcGoogle size={18} /> Continue with Google
      </button>
      <p className="text-center text-sm text-stone mt-8">
        Don't have an account? <Link href="/signup" className="text-clay font-medium">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
