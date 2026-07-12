"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="relative flex flex-col items-center gap-4">
          {/* Spinner animado con efecto de gradiente */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-cyan-400 animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Verificando sesión...
            </p>
            <p className="text-sm text-slate-500 mt-1">Conectando con la plataforma IoT</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirigiendo en useEffect...
  }

  return <>{children}</>;
};
