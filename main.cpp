#include <Arduino.h> // Necesario para usar la función Serial

void setup() {
  // Inicia la comunicación serial a 115200 baudios para poder ver los mensajes en la computadora
  Serial.begin(115200);
  
  // Imprime el mensaje "Hola Mundo" una sola vez al arrancar
  Serial.println("Hola Mundo desde ESP32!");
}

void loop() {
  // También podemos imprimirlo repetidamente en el bucle si lo deseas:
  // Serial.println("Hola Mundo continuo!");
  // delay(2000); // Espera 2 segundos antes de volver a imprimir
}
