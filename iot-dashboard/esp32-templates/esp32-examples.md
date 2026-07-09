# Plantillas de Código para el ESP32 (WiFi y LoRaWAN)

Este documento contiene dos ejemplos prácticos de código para tu microcontrolador **ESP32** para conectarse con la plataforma web IoT, además del código del **Payload Formatter** necesario si trabajas con redes LoRaWAN reales.

---

## Opción A: Envío directo vía WiFi (HTTP POST JSON)

Usa esta opción si tu placa ESP32 tiene acceso a una red WiFi local. Enviará un objeto JSON directamente a la URL de la Cloud Function en Firebase.

### Código de Arduino/C++ para ESP32:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Necesario instalar la biblioteca "ArduinoJson" de Benoit Blanchon

// --- CONFIGURACIÓN WIFI ---
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// --- CONFIGURACIÓN CLOUD FUNCTION ---
// Reemplaza con la URL que te provee Firebase tras hacer: firebase deploy
const char* serverName = "https://posttelemetry-xxxxxxx-uc.a.run.app"; 
const char* apiKey = "loranode_secure_api_key_2026"; // Definido en functions/index.js

// Intervalo de lectura (en milisegundos)
unsigned long delayTime = 30000; // 30 segundos (en producción usar Deep Sleep)
unsigned long lastTime = 0;

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  Serial.println("Conectando a WiFi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Conectado con éxito. IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Enviar cada 'delayTime' milisegundos
  if ((millis() - lastTime) > delayTime) {
    if(WiFi.status() == WL_CONNECTED){
      
      // 1. Leer sensores de variables (Simuladas en este ejemplo)
      float t = 24.0 + (random(0, 40) / 10.0); // Simula temp entre 24.0 y 28.0 °C
      float h = 55.0 + (random(0, 100) / 10.0); // Simula humedad entre 55.0 y 65.0 %
      float battery = 3.7 + (random(0, 5) / 10.0); // Simula voltaje batería 3.7V - 4.2V
      int wifiRssi = WiFi.RSSI();

      // 2. Crear documento JSON
      StaticJsonDocument<200> doc;
      doc["deviceId"] = "esp32-nodo-wifi-01";
      doc["temperature"] = t;
      doc["humidity"] = h;
      doc["battery"] = battery;
      doc["rssi"] = wifiRssi;
      doc["snr"] = 10.0; // Valor de prueba en WiFi

      String jsonString;
      serializeJson(doc, jsonString);

      // 3. Inicializar petición HTTP
      WiFiClientSecure client;
      client.setInsecure(); // Permite conexiones HTTPS omitiendo validación estricta de certificados
      
      HTTPClient http;
      http.begin(client, serverName);
      
      // Añadir cabeceras para autenticación y tipo de contenido
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-api-key", apiKey);

      Serial.print("Enviando telemetría... ");
      int httpResponseCode = http.POST(jsonString);
      
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.print("Código HTTP: ");
        Serial.println(httpResponseCode);
        Serial.println("Respuesta del servidor: " + response);
      } else {
        Serial.print("Error en envío HTTP. Código: ");
        Serial.println(httpResponseCode);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Desconectado");
    }
    lastTime = millis();
  }
}
```

---

## Opción B: Conexión mediante Red LoRaWAN (TTN / ChirpStack)

En redes LoRaWAN, el ESP32 transmite datos optimizados en **bytes binarios** (no JSON, para ahorrar ancho de banda). El Gateway reenvía los bytes y el Servidor de Red decodifica el payload y lo envía a la Cloud Function.

### 1. Código ESP32 (Arduino C++ con biblioteca MCCI LMIC):
Este código toma variables como flotantes, las escala para convertirlas en enteros de 16 bits sin decimales y las introduce en un buffer binario de 6 bytes.

```cpp
#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>

// Credenciales LoRaWAN (OTAA) obtenidas de TTN o ChirpStack (MSB format)
static const u1_t PROGMEM APPEUI[8] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
void fp_getAppEui (u1_t* buf) { memcpy_P(buf, APPEUI, 8);}

static const u1_t PROGMEM DEVEUI[8] = { 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88 }; // Reemplazar
void fp_getDevEui (u1_t* buf) { memcpy_P(buf, DEVEUI, 8);}

static const u1_t PROGMEM APPKEY[16] = { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99 }; // Reemplazar
void fp_getAppKey (u1_t* buf) { memcpy_P(buf, APPKEY, 16);}

// Pines SPI del ESP32 asociados al chip LoRa (ej. RFM95 / SX1276)
const lmic_pinmap lmic_pins = {
    .nss = 18,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 14,
    .dio = {26, 33, LMIC_UNUSED_PIN},
};

void do_send(osjob_t* j){
    // Verificar si no hay transmisiones en curso
    if (LMIC.opmode & OP_TXRXPEND) {
        Serial.println(F("Transmisión pendiente, omitiendo envío actual."));
    } else {
        // 1. Leer sensores (ejemplo simulado)
        float temp = 25.4; 
        float hum = 61.2;
        float bat = 3.95;

        // 2. Empaquetar floats en formato entero escala (2 bytes por variable)
        uint16_t t_payload = (uint16_t)((temp + 100.0) * 100); // Rango de -100°C a +555°C, con dos decimales
        uint16_t h_payload = (uint16_t)(hum * 100);
        uint16_t b_payload = (uint16_t)(bat * 100);

        byte payload[6];
        payload[0] = t_payload >> 8;
        payload[1] = t_payload & 0xFF;
        payload[2] = h_payload >> 8;
        payload[3] = h_payload & 0xFF;
        payload[4] = b_payload >> 8;
        payload[5] = b_payload & 0xFF;

        // 3. Transmitir por LoRaWAN en el puerto 1
        LMIC_setTxData2(1, payload, sizeof(payload), 0);
        Serial.println(F("Paquete LoRa colocado en cola de envío."));
    }
}

// ... Resto del ciclo de vida y handlers de eventos LMIC necesarios ...
```

### 2. Payload Formatter (JavaScript para The Things Network o ChirpStack):
Debes copiar esta función en la consola de tu Servidor de Red LoRaWAN para que los bytes recibidos del ESP32 se transformen en variables JSON legibles antes de enviarse al Webhook de Firebase Cloud Functions.

```javascript
function decodeUplink(input) {
  var data = {};
  
  // Reconstruir variables desde los 6 bytes
  if (input.bytes.length >= 6) {
    // Eje temperatura: (byte0 * 256 + byte1) / 100 - 100 (Restar offset)
    var rawTemp = (input.bytes[0] << 8) | input.bytes[1];
    data.temperature = (rawTemp / 100) - 100;

    // Eje humedad
    var rawHum = (input.bytes[2] << 8) | input.bytes[3];
    data.humidity = rawHum / 100;

    // Eje voltaje de batería
    var rawBat = (input.bytes[4] << 8) | input.bytes[5];
    data.battery = rawBat / 100;
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}
```
