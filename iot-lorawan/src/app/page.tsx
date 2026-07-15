import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#070b19]/60 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              IoT <span className="text-cyan-400">LoRaWAN</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono">ESP32 HELTEC PLATFORM</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/data" className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
            Datos
          </Link>
          <Link href="/login" className="px-5 py-2 text-sm font-medium rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-[#010828] text-white border border-white/10 hover:border-cyan-400 transition-all shadow-md hover:shadow-cyan-500/10">
            Ingresar
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex-grow grid md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Copywriting */}
        <div className="md:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono w-fit animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            ESP32 Heltec V3 Activo
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Monitoreo de Telemetría <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
              IoT en Tiempo Real
            </span>
          </h2>
          <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
            Visualiza y administra de forma segura las variables críticas de temperatura y humedad enviadas desde tus placas **ESP32 Heltec**. Diseñado para operar mediante redes inalámbricas directas o enlaces LoRaWAN de largo alcance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-center shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Ir al Dashboard
            </Link>
            <Link href="/data" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-center border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Ver Tabla de Datos
            </Link>
          </div>

          {/* Data Flow Diagram (Miniature) */}
          <div className="mt-8 liquid-glass rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono">
              Flujo de Ingesta y Datos JSON
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-indigo-300 border border-white/5">
                <span className="text-gray-500">{"// POST /api/sensor"}</span>
                <pre className="text-cyan-400 mt-2">
{`{
  "temperatura": 25.4,
  "humedad": 62.8,
  "timestamp": "2026-06-24T17:45Z"
}`}
                </pre>
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>1. ESP32 envía telemetría JSON</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>2. Cloud Function valida variables</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>3. Firestore almacena con seguridad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>4. Webapp Next.js renderiza gráficos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Diagram */}
        <div className="md:col-span-5 flex justify-center items-center relative animate-float">
          {/* Glass Card Container */}
          <div className="w-full max-w-[400px] aspect-square rounded-[32px] liquid-glass p-8 flex flex-col justify-between shadow-2xl relative">
            {/* Sensor nodes / abstract graphics */}
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-mono text-cyan-400/80">NODE_01_HELTEC</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-mono text-gray-500">CONNECTED</span>
              </span>
            </div>

            {/* Simulated Live Variables Display */}
            <div className="my-8 flex flex-col gap-6">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono uppercase">Temperatura</span>
                  <span className="text-5xl font-black tracking-tight text-white">24.8°C</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono uppercase">Humedad</span>
                  <span className="text-5xl font-black tracking-tight text-white">58.3%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Wireless Signal Waves Visualizer */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 items-end h-4">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                  <div className="w-1 h-2.5 bg-cyan-400 rounded-full"></div>
                  <div className="w-1 h-3.5 bg-cyan-400 rounded-full"></div>
                  <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                </div>
                <span className="text-xs font-mono text-gray-500">RSSI: -82 dBm</span>
              </div>
              <span className="text-xs font-mono text-gray-400">SNR: 8.5 dB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 px-6 py-6 text-center text-xs text-gray-600 font-mono">
        <p>© 2026 IoT Lorawan Platform. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
