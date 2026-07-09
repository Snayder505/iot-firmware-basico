/**
 * Firebase Cloud Functions (v2) - Ingesta de Telemetría IoT
 * Recibe los datos enviados desde un ESP32 o mediante Webhook LoRaWAN,
 * valida el formato y los almacena de forma segura en Firestore.
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Inicializar el SDK de Admin para acceder a Firestore sin restricciones del cliente
admin.initializeApp();
const db = admin.firestore();

// API Key simple para proteger el endpoint (Recomendable cambiar por una segura)
const API_KEY = "loranode_secure_api_key_2026";

exports.postTelemetry = onRequest({ cors: true }, async (req, res) => {
  // Solo se permiten peticiones HTTP POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Utilizar POST." });
  }

  // Validación de API Key (Opcional pero recomendado para producción)
  const incomingApiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (incomingApiKey && incomingApiKey !== API_KEY) {
    return res.status(401).json({ error: "No autorizado. API Key incorrecta." });
  }

  try {
    const payload = req.body;
    
    // Variables por defecto a rellenar
    let deviceId = "unknown-device";
    let temperature = null;
    let humidity = null;
    let battery = null;
    let rssi = null;
    let snr = null;
    
    // =========================================================================
    // DETECCIÓN DEL ORIGEN DE LOS DATOS (LoRaWAN LNS vs HTTP Directo)
    // =========================================================================
    
    // CASO A: Webhook de The Things Network (TTS v3)
    if (payload.end_device_ids && payload.uplink_message) {
      deviceId = payload.end_device_ids.device_id || deviceId;
      
      const uplink = payload.uplink_message;
      
      // Intentar extraer variables decodificadas del Payload Formatter de TTN
      const decoded = uplink.decoded_payload || {};
      temperature = decoded.temperature || decoded.temp || decoded.t || null;
      humidity = decoded.humidity || decoded.hum || decoded.h || null;
      battery = decoded.battery || decoded.bat || decoded.vbat || decoded.v || null;
      
      // Si no hay variables decodificadas pero sí payload crudo, podemos guardar el hexadecimal
      // para parsear en el frontend o reportarlo
      
      // Extraer datos de señal LoRa (RSSI y SNR)
      if (uplink.rx_metadata && uplink.rx_metadata.length > 0) {
        // Tomar la señal del gateway con mejor recepción (el primero suele ser el mejor)
        rssi = uplink.rx_metadata[0].rssi || null;
        snr = uplink.rx_metadata[0].snr || null;
      }
    }
    // CASO B: Webhook de ChirpStack LoRaWAN Server
    else if (payload.deviceInfo && payload.object) {
      deviceId = payload.deviceInfo.deviceName || payload.deviceInfo.devEui || deviceId;
      
      const object = payload.object || {};
      temperature = object.temperature || object.temp || null;
      humidity = object.humidity || object.hum || null;
      battery = object.battery || object.bat || null;
      
      if (payload.rxInfo && payload.rxInfo.length > 0) {
        rssi = payload.rxInfo[0].rssi || null;
        snr = payload.rxInfo[0].loRaSNR || null;
      }
    }
    // CASO C: Envío directo simple por HTTP POST (por ejemplo, ESP32 vía WiFi directo)
    else if (payload.deviceId) {
      deviceId = payload.deviceId;
      temperature = payload.temperature !== undefined ? parseFloat(payload.temperature) : null;
      humidity = payload.humidity !== undefined ? parseFloat(payload.humidity) : null;
      battery = payload.battery !== undefined ? parseFloat(payload.battery) : null;
      rssi = payload.rssi !== undefined ? parseInt(payload.rssi) : -50; // default WiFi óptimo
      snr = payload.snr !== undefined ? parseFloat(payload.snr) : 10;
    }
    // Si no cumple ninguna estructura básica estructurada
    else {
      return res.status(400).json({ 
        error: "Formato de payload no reconocido. Debe contener al menos 'deviceId' o la estructura de un servidor LoRaWAN." 
      });
    }

    // Formatear el objeto de variables a guardar
    const telemetryRecord = {
      deviceId: deviceId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        temperature: temperature !== null ? Number(temperature) : null,
        humidity: humidity !== null ? Number(humidity) : null,
        battery: battery !== null ? Number(battery) : null,
        rssi: rssi !== null ? Number(rssi) : null,
        snr: snr !== null ? Number(snr) : null
      },
      receivedAt: new Date().toISOString()
    };

    // Registrar en logs de Firebase para depuración
    console.log(`Guardando telemetría para dispositivo ${deviceId}:`, JSON.stringify(telemetryRecord.data));

    // Escribir en la colección '/telemetry' de Firestore
    const docRef = await db.collection("telemetry").add(telemetryRecord);

    // Opcional: Actualizar el estado del dispositivo en la colección `/devices`
    // para saber cuándo fue su última transmisión y sus últimos valores reportados
    await db.collection("devices").doc(deviceId).set({
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      lastData: telemetryRecord.data
    }, { merge: true });

    return res.status(200).json({ 
      success: true, 
      message: "Telemetría guardada correctamente.", 
      documentId: docRef.id 
    });

  } catch (error) {
    console.error("Error al procesar la telemetría:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor al almacenar los datos." 
    });
  }
});
