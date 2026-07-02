"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message?.replace("Firebase: ", "") || "Failed to send reset email");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-3xl text-charcoal mb-2">Reset Password</h1>
      <p className="text-stone mb-8 text-sm">We'll email you a link to reset your password.</p>
      {sent ? (
        <p className="bg-sage/10 text-sage rounded-lg p-4 text-sm">Check your inbox for a reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          <button type="submit" className="btn-primary w-full">Send Reset Link</button>
        </form>
      )}
    </div>
  );
}
