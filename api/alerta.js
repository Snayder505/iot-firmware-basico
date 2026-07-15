// api/alerta.js
// Microservicio Serverless Function para enviar alertas de IoT a Telegram

export default async function handler(req, res) {
  // Solo permitimos peticiones POST (para recibir datos de sensores)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // Desestructuramos los datos que esperamos recibir en el cuerpo de la petición (JSON)
  const { dispositivoId, temperatura, humedad } = req.body;

  // CREDENCIALES REALES CONFIGURADAS
  const TELEGRAM_TOKEN = '8767164488:AAGG3wV14TW_rxJBePLethpZTRXvMGxJ9xQ';
  const TELEGRAM_CHAT_ID = '7304953271';

  // Límite de seguridad para disparar la alerta (ejemplo: > 30°C)
  const LIMITE_TEMPERATURA = 30.0;

  // Evaluamos si la temperatura supera el límite
  if (temperatura > LIMITE_TEMPERATURA) {
    // Creamos un mensaje formateado y bonito con emojis y Markdown
    const mensaje = `⚠️ *¡ALERTA DE TEMPERATURA!* ⚠️\n\n` +
                    `🤖 *Dispositivo:* ${dispositivoId || 'ESP32_Default'}\n` +
                    `🌡️ *Temperatura:* *${temperatura.toFixed(1)}°C* (Límite: ${LIMITE_TEMPERATURA}°C)\n` +
                    `💧 *Humedad:* ${humedad.toFixed(1)}%\n\n` +
                    `🚨 *Acción sugerida:* Revisar el sistema de refrigeración de inmediato.`;

    try {
      // Preparamos la llamada a la API de Telegram sendMessage
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: mensaje,
          parse_mode: 'Markdown' // Para que el texto se vea con negritas y emojis bonitos
        })
      });

      const data = await response.json();

      // Verificamos si Telegram aceptó el mensaje
      if (data.ok) {
        return res.status(200).json({ status: 'Alerta enviada con éxito a Telegram.' });
      } else {
        return res.status(500).json({ error: 'Error al enviar a Telegram', detalles: data });
      }

    } catch (error) {
      // Capturamos cualquier error en el proceso
      return res.status(500).json({ error: 'Error interno en el microservicio', detalles: error.message });
    }
  }

  // Si la temperatura es normal, respondemos que no fue necesario alertar
  return res.status(200).json({ status: 'Lectura procesada. Valores dentro del rango normal.' });
}
