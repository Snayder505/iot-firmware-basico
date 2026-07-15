#include <Arduino.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <WiFi.h>

// Configuración de red Wi-Fi
const char *ssid = "NetXander 2.4G";
const char *password = "patrick1103902241";

// URL de tu Firebase Cloud Function (reemplaza con la que te dé Firebase
// deploy)
const char *serverUrl =
    "https://console.firebase.google.com/project/iot-esp32-cc83a/overview";

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Conectar a Wi-Fi
  Serial.print("Conectando a Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wi-Fi conectado con éxito.");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Esperar 10 segundos entre lecturas
  delay(10000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Validar si las lecturas fallaron
  if (isnan(h) || isnan(t)) {
    Serial.println("Error al leer el sensor DHT11.");
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(t);
  Serial.print(" °C | Humedad: ");
  Serial.print(h);
  Serial.println(" %");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Construir JSON payload
    String jsonPayload =
        "{\"temperatura\":" + String(t) + ",\"humedad\":" + String(h) + "}";

    Serial.print("Enviando JSON: ");
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Código de respuesta HTTP: ");
      Serial.println(httpResponseCode);
      Serial.print("Respuesta: ");
      Serial.println(response);
    } else {
      Serial.print("Error en petición POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Error: Conexión Wi-Fi perdida.");
  }
}
