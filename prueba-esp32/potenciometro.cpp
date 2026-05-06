#include <Arduino.h>

// Definición de pines
const int pinPot = 34;  // Pin para el potenciómetro
const int pinLED = 22;  // Pin solicitado para el LED

// Parámetros PWM
const int frecuencia = 5000;
const int resolucion = 8; // Rango de 0 a 255 (8 bits)

void setup() {
  Serial.begin(115200);

  // NUEVA FORMA: Ya no necesitas ledcSetup ni canales.
  // Solo configuras la frecuencia y resolución directamente al pin.
  ledcAttach(pinLED, frecuencia, resolucion);
  
  Serial.println("Sistema listo en GPIO 22 con nueva API...");
}

void loop() {
  // Leer el valor analógico del potenciómetro (0 - 4095)
  int lecturaADC = analogRead(pinPot);

  // Escalar de 12 bits (ADC) a 8 bits (PWM)
  int brillo = map(lecturaADC, 0, 4095, 0, 255);

  // NUEVA FORMA: Usas el pin directamente en lugar del canal
  ledcWrite(pinLED, brillo);

  // Salida de datos para el Monitor Serie
  Serial.print("Valor Pot: ");
  Serial.print(lecturaADC);
  Serial.print(" | Intensidad LED: ");
  Serial.println(brillo);

  delay(15); 
}
