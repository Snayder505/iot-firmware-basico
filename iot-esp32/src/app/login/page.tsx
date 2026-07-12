"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Cpu, AlertCircle } from "lucide-react";


export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Ocurrió un error inesperado al iniciar sesión con Google.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background gradients and lights */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-cyan-950/20 blur-[130px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />

      {/* Center login card */}
      <div className="relative w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <Cpu className="h-7 w-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Plataforma IoT
          </h1>
          <p className="text-sm text-slate-400 mt-2 text-center">
            Inicia sesión para visualizar y administrar tus dispositivos en tiempo real
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={handleLogin}
          disabled={isLoggingIn || loading}
          className="w-full py-4 px-6 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-white/5 group"
        >
          <svg className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoggingIn || loading ? "Conectando..." : "Iniciar sesión con Google"}
        </button>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Al continuar, aceptas la política de privacidad y términos del sistema.</p>
        </div>
      </div>
    </div>
  );
}
