#include <Arduino.h> // Incluye la librería base para que los comandos funcionen en el ESP32

// Define una constante entera para guardar el número del pin donde está conectado el LED (pin 22)
const int ledPin = 22;

// La función setup se ejecuta una sola vez cada vez que el ESP32 se enciende o reinicia
void setup() {
  // Configura el pin 22 (ledPin) como una salida de energía (OUTPUT) para poder enviar voltaje
  pinMode(ledPin, OUTPUT);
}

// La función loop se ejecuta de forma repetitiva e infinita después del setup
void loop() {
  // Envía un nivel alto de energía (HIGH) al pin 22 para encender el LED
  digitalWrite(ledPin, HIGH);
  
  // Pausa el programa durante 1000 milisegundos (1 segundo) manteniendo el LED encendido
  delay(1000);                
  
  // Envía un nivel bajo de energía (LOW) al pin 22, cortando el voltaje para apagar el LED
  digitalWrite(ledPin, LOW);  
  
  // Pausa el programa durante 1000 milisegundos (1 segundo) manteniendo el LED apagado antes de repetir
  delay(1000);               
}
