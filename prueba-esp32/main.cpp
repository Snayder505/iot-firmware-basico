#include <Arduino.h> // Incluimos la librería principal de Arduino para usar funciones básicas

// Definimos el pin al que está conectado el LED. 
// En este caso, solicitaste usar el GPIO 22.
const int ledPin = 22; 

void setup() {
  // La función setup() se ejecuta una sola vez cuando el ESP32 se enciende o se reinicia.
  
  // Configuramos el pin del LED (GPIO 22) como salida (OUTPUT).
  // Esto nos permite enviar voltaje por este pin para encender el LED.
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // La función loop() se ejecuta repetidamente de forma infinita después del setup().

  // Encendemos el LED. HIGH envía un nivel alto de voltaje (3.3V) al pin.
  digitalWrite(ledPin, HIGH); 
  
  // Esperamos 1000 milisegundos (1 segundo) con el LED encendido.
  delay(1000); 

  // Apagamos el LED. LOW envía un nivel bajo de voltaje (0V) al pin.
  digitalWrite(ledPin, LOW); 
  
  // Esperamos otros 1000 milisegundos (1 segundo) con el LED apagado antes de repetir el ciclo.
  delay(1000); 
}
