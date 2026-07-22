"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Cpu, 
  Table, 
  LayoutDashboard, 
  LogOut, 
  Loader2, 
  Thermometer, 
  Droplets, 
  Wifi, 
  WifiOff, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  FlaskConical, 
  Send 
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

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

interface AlertRecord {
  id: string;
  timestamp: string;
  dispositivoId: string;
  temperatura: number;
  telegramState: string;
}

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Sistema de Alertas
  const [alertHistory, setAlertHistory] = useState<AlertRecord[]>([]);
  const [simulatedAlert, setSimulatedAlert] = useState<{ temp: number; hum: number; timeStr: string } | null>(null);

  const TEMP_THRESHOLD = 30.0;

  useEffect(() => {
    // Escucha en tiempo real los últimos 30 registros para el gráfico y cards
    const q = query(collection(db, "sensor_data"), orderBy("timestamp", "desc"), limit(30));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: SensorData[] = [];
      snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as SensorData);
      });
      // Para el gráfico queremos el orden cronológico (de más antiguo a más nuevo)
      setData(records.reverse());
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener datos en tiempo real:", error);
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

  // Obtener el último registro recibido de Firestore
  const lastRecord = data.length > 0 ? data[data.length - 1] : null;

  const formatTimestamp = (ts: any) => {
    if (!ts) return "N/A";
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString("es-ES");
    }
    return new Date(ts).toLocaleString("es-ES");
  };

  // Valores efectivos (considerando si hay una simulación activa con el botón de prueba)
  const effectiveTemp = simulatedAlert 
    ? simulatedAlert.temp 
    : (lastRecord?.temperature ?? lastRecord?.temperatura ?? 0);

  const effectiveHum = simulatedAlert 
    ? simulatedAlert.hum 
    : (lastRecord?.humidity ?? lastRecord?.humedad ?? 0);

  const effectiveTimeStr = simulatedAlert 
    ? simulatedAlert.timeStr 
    : formatTimestamp(lastRecord?.timestamp);

  const isAlertActive = effectiveTemp > TEMP_THRESHOLD;

  // Registrar automáticamente cuando llega telemetría real que supera los 30 °C
  useEffect(() => {
    if (lastRecord) {
      const realTemp = lastRecord.temperature ?? lastRecord.temperatura ?? 0;
      if (realTemp > TEMP_THRESHOLD) {
        const devId = lastRecord.deviceId || lastRecord.device_id || lastRecord.dispositivoId || "ESP32_Fisico";
        const timeStr = formatTimestamp(lastRecord.timestamp);
        
        setAlertHistory((prev) => {
          if (prev.some((item) => item.timestamp === timeStr)) return prev;
          return [
            {
              id: Date.now().toString(),
              timestamp: timeStr,
              dispositivoId: devId,
              temperatura: realTemp,
              telegramState: "Enviado a Telegram 📱",
            },
            ...prev,
          ];
        });
      }
    }
  }, [lastRecord]);

  // Manejador del botón manual "Probar Alerta Visual" (Simulación de 35 °C)
  const handleTestAlert = () => {
    const simTemp = 35.0;
    const simHum = 68.4;
    const timeStr = new Date().toLocaleString("es-ES");
    const devId = lastRecord?.deviceId || lastRecord?.device_id || lastRecord?.dispositivoId || "ESP32_Fisico";

    setSimulatedAlert({
      temp: simTemp,
      hum: simHum,
      timeStr: timeStr,
    });

    const newRecord: AlertRecord = {
      id: Date.now().toString(),
      timestamp: timeStr,
      dispositivoId: devId,
      temperatura: simTemp,
      telegramState: "Enviado a Telegram 📱 (Prueba)",
    };

    setAlertHistory((prev) => [newRecord, ...prev]);
  };

  // Determinar si el dispositivo está en línea (últimos 5 min)
  const isOnline = () => {
    if (!lastRecord || !lastRecord.timestamp) return false;
    
    let lastTimeMs = 0;
    if (lastRecord.timestamp.seconds) {
      lastTimeMs = lastRecord.timestamp.seconds * 1000;
    } else {
      lastTimeMs = new Date(lastRecord.timestamp).getTime();
    }
    
    const diffMinutes = (Date.now() - lastTimeMs) / 1000 / 60;
    return diffMinutes < 5;
  };

  // Formatear hora para el eje X
  const formatXAxis = (timestamp: any) => {
    if (!timestamp) return "";
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Formatear datos para el gráfico
  const chartData = data.map((item) => ({
    ...item,
    hora: formatXAxis(item.timestamp),
    Temperatura: item.temperature ?? item.temperatura ?? 0,
    Humedad: item.humidity ?? item.humedad ?? 0,
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl">
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Cpu className="h-5 w-5 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                IoT ESP32
              </span>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === "/dashboard"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md shadow-indigo-500/5"
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

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Panel de Control</h1>
              <p className="text-slate-400 text-sm mt-1">Supervisión en tiempo real de tus microcontroladores</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md self-start md:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Suscripción Firestore Activa
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
              <p className="text-slate-400 text-sm">Esperando conexión de datos desde Firestore...</p>
            </div>
          ) : !lastRecord && !simulatedAlert ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-4 bg-slate-900/20 border border-slate-800 rounded-3xl">
              <Cpu className="h-16 w-16 text-slate-700 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-200 mb-2">Sin datos disponibles</h3>
              <p className="text-slate-400 max-w-md text-sm mb-6">
                No hemos recibido telemetría de ningún ESP32 en la colección <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">sensor_data</code>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Tarjetas Principales de Telemetría */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tarjeta Temperatura */}
                <div className={`relative overflow-hidden border rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 ${
                  isAlertActive 
                    ? "bg-red-950/30 border-red-500/60 shadow-xl shadow-red-950/40" 
                    : "bg-slate-900/40 border-slate-800"
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temperatura</p>
                      <h3 className={`text-4xl font-extrabold mt-2 ${isAlertActive ? "text-red-400 animate-pulse" : "text-rose-400"}`}>
                        {effectiveTemp.toFixed(1)}°C
                      </h3>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                      isAlertActive ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      <Thermometer className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
                    <Calendar className="h-3.5 w-3.5" />
                    Actualizado: {effectiveTimeStr}
                  </div>
                </div>

                {/* Tarjeta Humedad */}
                <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Humedad Relativa</p>
                      <h3 className="text-4xl font-extrabold text-cyan-400 mt-2">{effectiveHum.toFixed(1)}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Droplets className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
                    <Calendar className="h-3.5 w-3.5" />
                    Actualizado: {effectiveTimeStr}
                  </div>
                </div>

                {/* Tarjeta Estado Dispositivo */}
                <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado Dispositivo</p>
                      <div className="flex items-center gap-2 mt-2">
                        {isOnline() || simulatedAlert ? (
                          <>
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-3xl font-extrabold text-emerald-400">En Línea</span>
                          </>
                        ) : (
                          <>
                            <span className="h-3 w-3 rounded-full bg-slate-600"></span>
                            <span className="text-3xl font-extrabold text-slate-400">Fuera de Línea</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                      isOnline() || simulatedAlert ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                    }`}>
                      {isOnline() || simulatedAlert ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-4 border-t border-slate-800/60 pt-3">
                    <span className="font-mono text-indigo-400 font-semibold">
                      {lastRecord?.deviceId || lastRecord?.device_id || lastRecord?.dispositivoId || "ESP32_Fisico"}
                    </span>
                  </div>
                </div>

              </div>

              <!-- 🚨 CENTRO DE ALERTAS EN TIEMPO REAL -->
              <section className={`relative overflow-hidden border rounded-3xl p-6 backdrop-blur-xl transition-all duration-500 ${
                isAlertActive
                  ? "bg-red-950/20 border-red-500/60 shadow-2xl shadow-red-950/30"
                  : "bg-slate-900/40 border-slate-800"
              }`}>
                {/* Cabecera del Panel de Alertas */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-800/80 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        🚨 Centro de Alertas en Tiempo Real
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supervisión de sobrecalentamiento (&gt; 30.0 °C) y notificaciones a Telegram
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Badge de Estado Visual */}
                    {isAlertActive ? (
                      <span className="bg-red-600/90 text-white border border-red-400 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/40 animate-pulse">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                        ¡ALERTA ACTIVA! ({effectiveTemp.toFixed(1)}°C)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        SISTEMA NORMAL
                      </span>
                    )}

                    {/* Botón Probar Alerta Visual */}
                    <button
                      onClick={handleTestAlert}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 hover:border-red-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <FlaskConical className="h-4 w-4" />
                      Probar Alerta Visual
                    </button>
                  </div>
                </div>

                {/* Banner Destacado cuando Alerta está Activa */}
                {isAlertActive && (
                  <div className="mb-4 p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs sm:text-sm animate-pulse shadow-md">
                    <Bell className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span><strong>¡ATENCIÓN!</strong> La temperatura ha superado el umbral crítico de 30.0 °C. Evento notificado a Telegram.</span>
                  </div>
                )}

                {/* Histórico de Registros de Alertas (Tabla Responsive) */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sm:text-xs font-semibold tracking-wider sticky top-0 border-b border-slate-800 backdrop-blur-md">
                        <tr>
                          <th className="py-3 px-4">Fecha y Hora</th>
                          <th className="py-3 px-4">Dispositivo</th>
                          <th className="py-3 px-4">Temperatura</th>
                          <th className="py-3 px-4 text-right">Estado Telegram</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {alertHistory.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                              <CheckCircle2 className="h-6 w-6 text-emerald-500/40 mx-auto mb-2" />
                              No se han registrado eventos de alerta. El sistema opera dentro de los rangos normales.
                            </td>
                          </tr>
                        ) : (
                          alertHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-300">{item.timestamp}</td>
                              <td className="py-3 px-4 font-semibold text-indigo-300">{item.dispositivoId}</td>
                              <td className="py-3 px-4 font-extrabold text-red-400">{item.temperatura.toFixed(1)} °C</td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-medium">
                                  <Send className="h-3 w-3 text-sky-400" />
                                  {item.telegramState}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Gráfico Analítico */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-400" />
                      Gráfico Analítico en Tiempo Real
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Visualización de las últimas {data.length} lecturas de temperatura (°C) y humedad (%)
                    </p>
                  </div>
                </div>

                <div className="h-96 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="hora"
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "16px",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Line
                        type="monotone"
                        dataKey="Temperatura"
                        stroke="#f87171"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        dot={{ strokeWidth: 2, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Humedad"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        dot={{ strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
