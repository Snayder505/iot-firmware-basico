"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070b19] text-white">
        <div className="relative flex items-center justify-center">
          {/* Neon Ring Loader */}
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-4 border-purple-500/20 border-b-fuchsia-500 rounded-full animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-cyan-400/80 font-mono text-sm tracking-widest uppercase animate-pulse">
          Validando Sesión...
        </p>

        <style jsx global>{`
          @keyframes spin-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          .animate-spin-reverse {
            animation: spin-reverse 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null; // Evitar flash de contenido protegido
  }

  return <>{children}</>;
};
