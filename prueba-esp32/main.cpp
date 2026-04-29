#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h" // Librería nativa del ESP32 para controlar los pines

// Definimos el pin del LED que vamos a utilizar (GPIO 22)
#define LED_PIN GPIO_NUM_22

// En el entorno nativo del ESP32 (ESP-IDF), el programa siempre inicia en 'app_main'
// Se usa extern "C" para que el compilador de C++ lo reconozca correctamente.
extern "C" void app_main(void) {
    
    // 1. Preparamos el pin
    gpio_reset_pin(LED_PIN);
    
    // 2. Configuramos el pin GPIO 22 como salida (OUTPUT)
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);

    // 3. Creamos un bucle infinito (similar al loop de Arduino)
    while (true) {
        // Encendemos el LED (1 = HIGH / Encendido)
        gpio_set_level(LED_PIN, 1);
        
        // Esperamos 1000 milisegundos (1 segundo). 
        // En el ESP32 nativo usamos vTaskDelay del sistema operativo FreeRTOS.
        vTaskDelay(1000 / portTICK_PERIOD_MS);

        // Apagamos el LED (0 = LOW / Apagado)
        gpio_set_level(LED_PIN, 0);
        
        // Esperamos otros 1000 milisegundos
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
