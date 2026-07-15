"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Cpu, Table, LayoutDashboard, LogOut, Loader2, Thermometer, Droplets, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SensorData {
  id: string;
  deviceId?: string;
  device_id?: string;
  dispositivoId?: string;
  temperature?: number;
  temperatura?: number;
  humidity?: number;
  humedad?: number;
  timestamp: any;
}

export default function DataPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sensor_data"), orderBy("timestamp", "desc"), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: SensorData[] = [];
      snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as SensorData);
      });
      setData(records);
      setLoading(false);
    }, (error) => {
      console.error("Error al suscribirse a Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "N/A";
    
    // Si es un Timestamp de Firestore
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString("es-ES");
    }
    
    // Si es una fecha string o milisegundos
    return new Date(ts).toLocaleString("es-ES");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl">
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                IoT ESP32
              </span>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === "/dashboard"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/data"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === "/data"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Table className="h-4 w-4" />
                Historial de Datos
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="h-9 w-9 rounded-full ring-2 ring-indigo-500/30" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || "Usuario IoT"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-900/50 hover:bg-red-950/10 hover:text-red-400 text-slate-400 text-xs font-medium transition-all duration-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Historial de Variables</h1>
              <p className="text-slate-400 text-sm mt-1">Registros capturados en tiempo real desde Firestore</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md self-start md:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Conexión Activa
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-slate-400 text-sm">Cargando registros históricos...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <Cpu className="h-12 w-12 text-slate-700 mb-3" />
                <p className="text-slate-300 font-semibold">No hay registros de sensores</p>
                <p className="text-slate-500 text-sm max-w-sm mt-1">
                  Asegúrate de que tus dispositivos ESP32 envíen datos a la colección <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">sensor_data</code> en Firestore.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/20">
                      <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">ID Dispositivo</th>
                      <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Temperatura</th>
                      <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Humedad</th>
                      <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Fecha / Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20 transition-colors duration-200">
                        <td className="p-4 text-sm font-mono text-indigo-300">
                          {item.deviceId || item.device_id || item.dispositivoId || "ESP32-Default"}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-400">
                            <Thermometer className="h-4 w-4" />
                            {item.temperature ?? item.temperatura ?? 0}°C
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400">
                            <Droplets className="h-4 w-4" />
                            {item.humidity ?? item.humedad ?? 0}%
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Table Footer Summary */}
            {!loading && data.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/10 text-xs text-slate-500 text-right">
                Mostrando los últimos {data.length} registros del dispositivo.
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
