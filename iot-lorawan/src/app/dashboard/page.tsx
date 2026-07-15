"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface TelemetryReading {
  id: string;
  temperatura: number;
  humedad: number;
  timestamp: Timestamp | string | null;
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const q = query(
      collection(db, "telemetry"),
      orderBy("timestamp", "desc"),
      limit(20) // Mostrar últimas 20 lecturas en la gráfica
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TelemetryReading[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          temperatura: docData.temperatura,
          humedad: docData.humedad,
          timestamp: docData.timestamp,
        });
      });
      // El gráfico necesita los datos en orden cronológico (viejo a nuevo)
      setReadings(data.reverse());
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar telemetría:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Formatear hora para el eje X (usado en XAxis tickFormatter)
  const formatTimeX = (ts: Timestamp | string | null) => {
    if (!ts) return "";
    let d: Date;
    if (ts instanceof Timestamp) {
      d = new Date(ts.seconds * 1000);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  // Formatear label del Tooltip (acepta unknown ya que Recharts pasa ReactNode)
  const formatLabel = (label: unknown): string => {
    if (!label) return "";
    if (label instanceof Timestamp) {
      return new Date(label.seconds * 1000).toLocaleString("es-ES");
    }
    if (typeof label === "string") {
      const d = new Date(label);
      return isNaN(d.getTime()) ? label : d.toLocaleString("es-ES");
    }
    return String(label);
  };

  // Obtener último valor
  const getLatestReading = () => {
    if (readings.length === 0) return null;
    // Como invertimos el orden para el gráfico, la última lectura está al final del array
    return readings[readings.length - 1];
  };

  const latest = getLatestReading();

  // Calcular estado del dispositivo (online si reportó en los últimos 5 minutos)
  const getDeviceStatus = () => {
    if (!latest || !latest.timestamp) return { label: "SIN CONEXIÓN", color: "bg-red-500", text: "text-red-400" };
    
    let latestMs = 0;
    if (latest.timestamp instanceof Timestamp) {
      latestMs = latest.timestamp.seconds * 1000;
    } else {
      latestMs = new Date(latest.timestamp).getTime();
    }

    const diffMinutes = (Date.now() - latestMs) / (1000 * 60);
    
    if (diffMinutes <= 5) {
      return { label: "ACTIVO", color: "bg-green-500 animate-pulse", text: "text-green-400" };
    } else {
      return { label: "INACTIVO (STANDBY)", color: "bg-amber-500", text: "text-amber-400" };
    }
  };

  const status = getDeviceStatus();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#070b19] flex flex-col justify-between">
        <Navbar />

        {/* Dashboard grid */}
        <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-grow flex flex-col gap-8">
          
          {/* Header titles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Panel de Telemetría</h2>
              <p className="text-sm text-gray-400">Analíticas visuales e indicadores del hardware ESP32 Heltec.</p>
            </div>
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl liquid-glass border border-white/5">
              <span className={`w-2.5 h-2.5 rounded-full ${status.color}`}></span>
              <span className="text-xs font-mono font-bold text-white tracking-wider">ESP32: </span>
              <span className={`text-xs font-mono font-bold ${status.text}`}>{status.label}</span>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI: Temperatura */}
            <div className="rounded-2xl liquid-glass p-6 flex items-center justify-between border-l-4 border-l-red-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Temperatura Actual</span>
                <span className="text-3xl font-black text-white">
                  {latest ? `${latest.temperatura.toFixed(1)}°C` : "N/A"}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                {/* Thermometer SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>

            {/* KPI: Humedad */}
            <div className="rounded-2xl liquid-glass p-6 flex items-center justify-between border-l-4 border-l-cyan-400">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Humedad Actual</span>
                <span className="text-3xl font-black text-white">
                  {latest ? `${latest.humedad.toFixed(1)}%` : "N/A"}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                {/* Droplet SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>

            {/* KPI: Total Lecturas */}
            <div className="rounded-2xl liquid-glass p-6 flex items-center justify-between border-l-4 border-l-indigo-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total Lecturas</span>
                <span className="text-3xl font-black text-white">
                  {loading ? "..." : readings.length}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                {/* Database SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
            </div>

            {/* KPI: Último Reporte */}
            <div className="rounded-2xl liquid-glass p-6 flex items-center justify-between border-l-4 border-l-purple-500">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Último Reporte</span>
                <span className="text-lg font-black text-white tracking-tight font-mono">
                  {latest ? formatTimeX(latest.timestamp) : "N/A"}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                {/* Clock SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
          </div>

          {/* Graphs grid */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Graph 1: Temperatura */}
            <div className="rounded-3xl liquid-glass p-6 flex flex-col gap-4 shadow-xl border border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Histórico de Temperatura</h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Curva en tiempo real (°C)</p>
              </div>
              
              <div className="h-72 w-full mt-2">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTimeX} stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ background: '#0a0f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontFamily: 'sans-serif' }}
                        labelFormatter={formatLabel}
                      />
                      <Area type="monotone" dataKey="temperatura" name="Temperatura" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Graph 2: Humedad */}
            <div className="rounded-3xl liquid-glass p-6 flex flex-col gap-4 shadow-xl border border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Histórico de Humedad</h3>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Curva en tiempo real (%)</p>
              </div>

              <div className="h-72 w-full mt-2">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTimeX} stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ background: '#0a0f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontFamily: 'sans-serif' }}
                        labelFormatter={formatLabel}
                      />
                      <Area type="monotone" dataKey="humedad" name="Humedad" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-xs text-gray-600 font-mono border-t border-white/5">
          Conexión encriptada con Firestore Database.
        </footer>
      </div>
    </AuthGuard>
  );
}
