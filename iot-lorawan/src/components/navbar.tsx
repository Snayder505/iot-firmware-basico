"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#070b19]/60 border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:inline">IoT LoRaWAN</span>
        </Link>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          <Link
            href="/dashboard"
            className={`px-4 py-2 text-xs font-semibold rounded-lg font-sans transition-all ${
              pathname === "/dashboard"
                ? "bg-cyan-500 text-[#010828]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/data"
            className={`px-4 py-2 text-xs font-semibold rounded-lg font-sans transition-all ${
              pathname === "/data"
                ? "bg-cyan-500 text-[#010828]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Tabla de Datos
          </Link>
        </div>
      </div>

      {/* User Session Profile & Logout */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{user.displayName}</span>
              <span className="text-[10px] text-cyan-400/80 font-mono tracking-tight">{user.email}</span>
            </div>
            {/* User Avatar */}
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border border-cyan-400/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm border border-indigo-400/30">
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all"
            title="Cerrar sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
};
