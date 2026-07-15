"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Redirigir si ya está autenticado
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al autenticar con Google. Inténtalo de nuevo.";
      console.error(err);
      setError(message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#070b19]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight">IoT LoRaWAN</span>
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl liquid-glass p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative">
          
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">Ingresar al Portal</h2>
            <p className="text-sm text-gray-400">
              Accede de forma segura para visualizar los datos en tiempo real de tu ESP32 Heltec.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 mt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || loading}
              className="w-full py-4 px-6 rounded-2xl bg-white text-[#010828] font-bold flex items-center justify-center gap-3 transition-all hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg hover:shadow-cyan-400/20"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#010828]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.75H24v9.03h12.75c-.55 3-2.23 5.54-4.75 7.24l7.39 5.73C43.79 37.14 46.5 31.27 46.5 24z"/>
                    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.39-5.73c-2.11 1.4-4.81 2.31-8.5 2.31-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </button>
          </div>

          <div className="border-t border-white/5 pt-4 text-center">
            <Link href="/" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors">
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[10px] text-gray-600 font-mono">
        Solo para personal autorizado. Las conexiones están encriptadas y auditadas.
      </footer>
    </div>
  );
}
