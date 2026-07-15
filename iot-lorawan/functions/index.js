/**
 * Firebase Cloud Functions (v2) - Ingesta de Telemetría IoT
 * Recibe los datos enviados desde un ESP32 en formato JSON,
 * valida el formato y los almacena de forma segura en Firestore.
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Inicializar el SDK de Admin para acceder a Firestore
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Middleware para habilitar CORS
app.use(cors({ origin: true }));
app.use(express.json());

// Endpoint POST /sensor (que será accesible en la ruta /api/sensor)
app.post("/sensor", async (req, res) => {
  try {
    const payload = req.body;
    
    // Extraer variables del payload
    const temperatura = payload.temperatura;
    const humedad = payload.humedad;
    const timestamp = payload.timestamp;

    // Validación de campos obligatorios
    if (temperatura === undefined || humedad === undefined) {
      return res.status(400).json({ 
        error: "Formato de datos inválido. Debe contener al menos 'temperatura' y 'humedad'." 
      });
    }

    // Convertir y estructurar timestamp
    let finalDate = new Date();
    if (timestamp) {
      const parsedDate = new Date(timestamp);
      if (!isNaN(parsedDate.getTime())) {
        finalDate = parsedDate;
      }
    }

    // Objeto estructurado para Firestore
    const telemetryRecord = {
      temperatura: parseFloat(temperatura),
      humedad: parseFloat(humedad),
      timestamp: admin.firestore.Timestamp.fromDate(finalDate)
    };

    // Almacenar en la colección 'telemetry'
    const docRef = await db.collection("telemetry").add(telemetryRecord);

    return res.status(201).json({
      success: true,
      message: "Datos de telemetría guardados exitosamente.",
      id: docRef.id
    });

  } catch (error) {
    console.error("Error al procesar la telemetría:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor.", 
      details: error.message 
    });
  }
});

// Exportar la Cloud Function bajo el nombre 'api'
// La URL final generada terminará en /api/ y Express se encargará del endpoint /sensor
// Por lo tanto, el endpoint final será POST /api/sensor
exports.api = onRequest({ cors: true }, app);
