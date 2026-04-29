#include <Arduino.h>

// Definimos una clase en C++ para controlar el LED. 
// Esto hace que el código sea orientado a objetos (común en C++).
class LedController {
private:
    int pin; // Variable privada para almacenar el número de pin

public:
    // Constructor de la clase que inicializa el pin y lo configura como salida
    LedController(int gpioPin) {
        pin = gpioPin;
        pinMode(pin, OUTPUT);
    }

    // Método para encender el LED
    void turnOn() {
        digitalWrite(pin, HIGH);
    }

    // Método para apagar el LED
    void turnOff() {
        digitalWrite(pin, LOW);
    }
};

// Instanciamos un objeto de nuestra clase LedController en el GPIO 22
LedController miLed(22);

void setup() {
    // No necesitamos código aquí porque la configuración del pin (pinMode) 
    // ya se ejecuta automáticamente al instanciar 'miLed'.
}

void loop() {
    miLed.turnOn();   // Llamamos al método para encender el LED
    delay(1000);      // Esperamos 1000 milisegundos (1 segundo)
    
    miLed.turnOff();  // Llamamos al método para apagar el LED
    delay(1000);      // Esperamos otro segundo antes de repetir
}
