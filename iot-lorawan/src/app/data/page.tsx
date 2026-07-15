"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

interface TelemetryReading {
  id: string;
  temperatura: number;
  humedad: number;
  timestamp: Timestamp | string | null;
}

export default function DataPage() {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempFilter, setTempFilter] = useState("all");

  useEffect(() => {
    // Escuchar la colección 'telemetry' en tiempo real
    const q = query(collection(db, "telemetry"), orderBy("timestamp", "desc"), limit(100));
    
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
      setReadings(data);
      setLoadingReadings(false);
    }, (error) => {
      console.error("Error al escuchar telemetría:", error);
      setLoadingReadings(false);
    });

    return () => unsubscribe();
  }, []);

  // Formatear Timestamp
  const formatTimestamp = (ts: Timestamp | string | null) => {
    if (!ts) return "N/A";
    
    // Si es un Timestamp de Firestore
    if (ts instanceof Timestamp) {
      return new Date(ts.seconds * 1000).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
    
    // Si ya es un String
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString("es-ES");
  };

  // Filtrar lecturas
  const filteredReadings = readings.filter((reading) => {
    // Filtro de búsqueda textual (temperatura o humedad)
    const matchesSearch = 
      reading.temperatura.toString().includes(searchTerm) || 
      reading.humedad.toString().includes(searchTerm) ||
      formatTimestamp(reading.timestamp).toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por rangos de temperatura
    if (tempFilter === "high") {
      return matchesSearch && reading.temperatura >= 30;
    } else if (tempFilter === "low") {
      return matchesSearch && reading.temperatura <= 15;
    } else if (tempFilter === "mid") {
      return matchesSearch && reading.temperatura > 15 && reading.temperatura < 30;
    }
    return matchesSearch;
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (readings.length === 0) return;
    
    const headers = ["ID", "Temperatura (C)", "Humedad (%)", "Fecha y Hora"];
    const rows = readings.map((r) => [
      r.id,
      r.temperatura,
      r.humedad,
      `"${formatTimestamp(r.timestamp)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetria_lorawan_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#070b19] flex flex-col justify-between">
        <Navbar />

        {/* Main Section */}
        <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-grow flex flex-col gap-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Histórico de Variables</h2>
              <p className="text-sm text-gray-400">Lecturas en tiempo real transmitidas por el nodo ESP32.</p>
            </div>
            
            <button
              onClick={handleExportCSV}
              disabled={readings.length === 0}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#010828] font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm self-start md:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>

          {/* Filters card */}
          <div className="grid md:grid-cols-12 gap-4 items-center liquid-glass p-4 rounded-2xl border border-white/5">
            <div className="md:col-span-8 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar lecturas (ej. '24.5', '60.1', o fecha)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl liquid-glass-input text-sm font-sans"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <select
                value={tempFilter}
                onChange={(e) => setTempFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl liquid-glass-input text-sm font-sans"
              >
                <option value="all">Todas las temperaturas</option>
                <option value="high">Altas (&gt;= 30°C)</option>
                <option value="mid">Normales (15°C - 30°C)</option>
                <option value="low">Bajas (&lt;= 15°C)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full rounded-2xl overflow-hidden liquid-glass border border-white/5 shadow-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 font-mono text-xs tracking-wider text-cyan-400 uppercase">
                    <th className="py-4 px-6">ID Documento</th>
                    <th className="py-4 px-6 text-center">Temperatura</th>
                    <th className="py-4 px-6 text-center">Humedad</th>
                    <th className="py-4 px-6">Timestamp Sensor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-sm text-gray-300">
                  {loadingReadings ? (
                    // Skeleton Loader Rows
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-5 px-6"><div className="h-4 bg-white/10 rounded w-4/5"></div></td>
                        <td className="py-5 px-6"><div className="h-4 bg-white/10 rounded w-16 mx-auto"></div></td>
                        <td className="py-5 px-6"><div className="h-4 bg-white/10 rounded w-16 mx-auto"></div></td>
                        <td className="py-5 px-6"><div className="h-4 bg-white/10 rounded w-1/2"></div></td>
                      </tr>
                    ))
                  ) : filteredReadings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500 font-mono text-sm">
                        No se encontraron lecturas de telemetría disponibles.
                      </td>
                    </tr>
                  ) : (
                    filteredReadings.map((reading) => (
                      <tr key={reading.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-gray-500 select-all">
                          {reading.id}
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-white">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${
                            reading.temperatura >= 30 
                              ? "bg-red-500/10 text-red-400" 
                              : reading.temperatura <= 15 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "bg-green-500/10 text-green-400"
                          }`}>
                            {reading.temperatura.toFixed(1)} °C
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-white">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-400">
                            {reading.humedad.toFixed(1)} %
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-400">
                          {formatTimestamp(reading.timestamp)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
