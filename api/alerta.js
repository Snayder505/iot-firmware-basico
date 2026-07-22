// api/alerta.js
export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { dispositivoId, temperatura, humedad } = req.body || {};

  // Si no llegan datos correctos en el JSON
  if (temperatura === undefined || humedad === undefined) {
    return res.status(400).json({ error: 'Faltan los datos de temperatura o humedad en el cuerpo de la petición.' });
  }

  const TELEGRAM_TOKEN = '8767164488:AAGG3wV14TW_rxJBePLethpZTRXvMGxJ9xQ';
  const TELEGRAM_CHAT_ID = '7304953271';
  const LIMITE_TEMPERATURA = 30.0;

  if (Number(temperatura) > LIMITE_TEMPERATURA) {
    const mensaje = `⚠️ *¡ALERTA DE TEMPERATURA!* ⚠️\n\n` +
      `🤖 *Dispositivo:* ${dispositivoId || 'ESP32_Default'}\n` +
      `🌡️ *Temperatura:* *${Number(temperatura).toFixed(1)}°C* (Límite: ${LIMITE_TEMPERATURA}°C)\n` +
      `💧 *Humedad:* ${Number(humedad).toFixed(1)}%\n\n` +
      `🚨 *Acción sugerida:* Revisar el sistema de refrigeración de inmediato.`;

    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

      // Usamos el fetch nativo de Node.js (sin imports)
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: mensaje,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();

      if (data.ok) {
        return res.status(200).json({ status: 'Alerta enviada con éxito a Telegram.' });
      } else {
        return res.status(500).json({ error: 'Error al enviar a Telegram', detalles: data });
      }

    } catch (error) {
      return res.status(500).json({ error: 'Error interno en el servidor', detalles: error.message });
    }
  }

  return res.status(200).json({ status: 'Lectura procesada. Valores dentro del rango normal.' });
}