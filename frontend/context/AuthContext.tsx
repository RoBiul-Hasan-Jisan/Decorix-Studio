"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as fbUpdateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import api from "@/lib/axios";
import { AppUser } from "@/lib/types";
import toast from "react-hot-toast";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncBackendUser = async () => {
    try {
      const { data } = await api.post("/auth/sync");
      setUser(data);
    } catch (err: any) {
      console.error("Failed to sync user with backend", err);
      // Surface this instead of failing silently - the most common cause is
      // NEXT_PUBLIC_API_URL pointing at the wrong place, the backend being
      // down, or Firebase Admin credentials missing on the backend (which
      // makes every protected request fail even though the user is signed
      // in with Firebase on the frontend).
      toast.error(
        err?.code === "ERR_NETWORK"
          ? "Can't reach the server. Is the backend running and NEXT_PUBLIC_API_URL set correctly?"
          : err?.response?.data?.message || "Couldn't load your account. Please refresh the page."
      );
      setUser(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncBackendUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Welcome back!");
  };

  const signup = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fbUpdateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    toast.success("Account created! Please verify your email.");
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    toast.success("Welcome!");
  };

  const logout = async () => {
    await signOut(auth);
    toast.success("Logged out");
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent");
  };

  const refreshUser = async () => {
    await syncBackendUser();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        isAdmin: user?.role === "admin",
        login,
        signup,
        loginWithGoogle,
        logout,
        forgotPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
