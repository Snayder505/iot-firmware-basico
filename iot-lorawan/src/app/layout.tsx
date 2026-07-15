import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IoT LoRaWAN — Plataforma de Monitoreo Telemetría",
  description: "Monitoreo en tiempo real de variables de sensores ESP32 Heltec vía HTTP y conectividad LoRaWAN. Datos consolidados con analíticas avanzadas.",
  keywords: ["IoT", "LoRaWAN", "ESP32", "Heltec", "Firebase", "Firestore", "Next.js", "Telemetría"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${outfit.variable} font-sans bg-[#070b19] text-[#eff4ff] antialiased min-h-screen selection:bg-cyan-400 selection:text-[#010828]`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
