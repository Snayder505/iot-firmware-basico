import Link from "next/link";
import { Cpu, Activity, Database, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Background gradients and lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Header */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Cpu className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            IoT ESP32
          </span>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-medium hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md animate-pulse">
          <Activity className="h-3.5 w-3.5" /> Monitoreo IoT en Tiempo Real
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Control Total de tus Dispositivos{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ESP32 & Sensores
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Monitorea variables de temperatura, humedad y estado de tus microcontroladores de manera instantánea. Almacenamiento seguro, gráficos analíticos y visualización en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/dashboard"
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2"
          >
            Ir al Dashboard
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300"
          >
            Saber Más
          </a>
        </div>

        {/* Quick Features Row */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 backdrop-blur-sm text-left">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Transmisión Instantánea</h3>
            <p className="text-sm text-slate-400">
              Escucha en tiempo real mediante Firestore. Los gráficos y las tablas se actualizan al instante sin refrescar la página.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 backdrop-blur-sm text-left">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Base de Datos Firestore</h3>
            <p className="text-sm text-slate-400">
              Almacena el historial completo de tus dispositivos. Estructurado para telemetría eficiente de variables como temperatura y humedad.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 backdrop-blur-sm text-left">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Acceso Protegido</h3>
            <p className="text-sm text-slate-400">
              Seguridad total integrada con Firebase Auth. Autenticación rápida y segura mediante cuentas Google.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/80 text-center text-xs text-slate-500 z-10">
        <p>© 2026 Plataforma IoT ESP32. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
