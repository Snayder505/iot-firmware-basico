import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dispositivoId, temperatura, humedad } = body || {};

    if (temperatura === undefined || humedad === undefined) {
      return NextResponse.json(
        { error: "Faltan los datos de temperatura o humedad en la petición." },
        { status: 400 }
      );
    }

    const TELEGRAM_TOKEN = "8767164488:AAGG3wV14TW_rxJBePLethpZTRXvMGxJ9xQ";
    const TELEGRAM_CHAT_ID = "7304953271";
    const LIMITE_TEMPERATURA = 30.0;

    const tempNum = Number(temperatura);
    const humNum = Number(humedad);

    if (tempNum > LIMITE_TEMPERATURA) {
      const mensaje =
        `⚠️ *¡ALERTA DE TEMPERATURA!* ⚠️\n\n` +
        `🤖 *Dispositivo:* ${dispositivoId || "ESP32_Fisico"}\n` +
        `🌡️ *Temperatura:* *${tempNum.toFixed(1)}°C* (Límite: ${LIMITE_TEMPERATURA}°C)\n` +
        `💧 *Humedad:* ${humNum.toFixed(1)}%\n\n` +
        `🚨 *Acción sugerida:* Revisar el sistema de refrigeración de inmediato.`;

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: mensaje,
          parse_mode: "Markdown",
        }),
      });

      const data = await response.json();

      if (data.ok) {
        return NextResponse.json({
          status: "Alerta enviada con éxito a Telegram.",
          ok: true,
        });
      } else {
        return NextResponse.json(
          { error: "Error al enviar a Telegram", detalles: data },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      status: "Lectura procesada. Valores dentro del rango normal.",
      ok: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error interno en el servidor", detalles: error.message },
      { status: 500 }
    );
  }
}
