# Plataforma Web para Prototipo IoT (LoRaWAN & HTTP Dashboard)

Este proyecto es una plataforma completa para el monitoreo de variables de telemetría IoT (como temperatura, humedad, voltaje de batería) enviadas desde placas **ESP32** usando conectividad WiFi directa o redes **LoRaWAN**.

---

## 1. Arquitectura del Proyecto

El sistema se compone de tres capas principales:

1. **Hardware (ESP32):** El microcontrolador lee las variables y transmite los datos (ya sea mediante HTTP POST directo por WiFi o mediante transmisiones de radio LoRaWAN).
2. **Backend (Firebase):**
   - **Cloud Functions:** Recibe los datos vía HTTP (webhook flexible), valida las credenciales y guarda los datos en la base de datos.
   - **Cloud Firestore:** Base de datos en tiempo real no relacional donde se almacena el histórico y estado actual del dispositivo.
   - **Firebase Authentication:** Permite el registro e inicio de sesión seguro en el frontend utilizando cuentas de Google.
3. **Frontend (Vercel):** Aplicación web estática SPA (Single Page Application) construida en HTML5, CSS3 personalizado y Vanilla Javascript con ES Modules. Utiliza Chart.js para renderizar los gráficos de variables y se despliega nativamente en Vercel.

---

## 2. Estructura de Carpetas

```
iot-dashboard/
├── esp32-templates/
│   └── esp32-examples.md      # Ejemplos de código C++ (WiFi/LoRa) y Payload Formatter JS
├── firebase-backend/          # Reglas e infraestructura de Firebase
│   ├── functions/
│   │   ├── index.js          # Cloud Function de ingesta de datos
│   │   └── package.json      # Dependencias de la Cloud Function (Node.js)
│   ├── firebase.json         # Archivo de configuración general de Firebase
│   ├── firestore.rules       # Reglas de seguridad para Firestore
│   └── firestore.indexes.json# Índices de bases de datos
├── web-frontend/              # Aplicación Web estática SPA
│   ├── css/
│   │   └── styles.css        # Estilos visuales con estética Glassmorphic Premium
│   ├── js/
│   │   ├── firebase-config.js# Conexión e inicialización del SDK de Firebase
│   │   ├── auth.js           # Lógica de autenticación con Google
│   │   └── app.js            # Enrutador de la SPA, vistas y gráficos en tiempo real
│   └── index.html            # Contenedor principal de la SPA
└── README.md                  # Este documento
```

---

## 3. Guía de Configuración y Despliegue

### Paso 1: Configurar Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto llamado `iot-dashboard`.
2. Habilita **Firebase Authentication**:
   - Ve a Authentication -> Sign-in method -> Añadir nuevo proveedor -> Selecciona **Google**.
   - Configura el correo de soporte del proyecto y guarda.
3. Habilita **Cloud Firestore**:
   - Ve a Firestore Database -> Crear base de datos -> Elige la ubicación más cercana y actívala en modo de prueba o producción (desplegaremos nuestras propias reglas seguras después).
4. Crea la app web en Firebase:
   - En la página general del proyecto, haz clic en el icono web (`</>`) para registrar una aplicación.
   - Copia las claves que aparecen en el objeto `firebaseConfig`.
5. Pega estas claves dentro del archivo `web-frontend/js/firebase-config.js`, reemplazando los placeholders con tus credenciales reales:
   ```javascript
   const firebaseConfig = {
     apiKey: "TU_API_KEY_REAL",
     authDomain: "TU_PROJECT_ID.firebaseapp.com",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_PROJECT_ID.appspot.com",
     messagingSenderId: "TU_SENDER_ID",
     appId: "TU_APP_ID",
     measurementId: "TU_MEASUREMENT_ID"
   };
   ```

### Paso 2: Desplegar el Backend de Firebase
Para desplegar las Cloud Functions y las Reglas de Seguridad de Firestore, requerirás Node.js y Firebase CLI:
1. Instala Firebase CLI de forma global:
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en tu cuenta de Firebase:
   ```bash
   firebase login
   ```
3. Desde tu terminal, posiciónate en la carpeta `firebase-backend/` y asocia el proyecto:
   ```bash
   firebase use --add
   ```
   *(Elige el ID del proyecto de Firebase que acabas de crear)*
4. Instala las dependencias de las Cloud Functions e implementa todo:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy
   ```
5. Tras el despliegue exitoso, la terminal te proporcionará la **URL pública de la Cloud Function** `postTelemetry`. Por ejemplo:
   `https://posttelemetry-xxxxxxx-uc.a.run.app`
   *Guarda esta URL, ya que es la que debes configurar en tu ESP32 o en el webhook de The Things Network/ChirpStack.*

### Paso 3: Desplegar el Frontend en Vercel
Vercel desplegará este sitio web estático instantáneamente:
1. Sube este proyecto (`iot-dashboard`) a tu repositorio de GitHub, GitLab o Bitbucket.
2. Ve a [Vercel](https://vercel.com/) e inicia sesión.
3. Haz clic en **Add New** -> **Project** e importa tu repositorio.
4. En la configuración del proyecto de Vercel:
   - **Root Directory:** Escribe o selecciona `web-frontend`.
   - **Build and Development Settings:** Deja la configuración por defecto (Vercel detecta automáticamente que es un proyecto estático sin build y servirá el `index.html` de forma directa).
5. Haz clic en **Deploy**. ¡Tu dashboard ya estará en línea con HTTPS gratuito!

---

## 4. Pruebas y Simulación

### Probar Ingesta con cURL (Simular ESP32)
Puedes simular el envío de un paquete de datos HTTP POST desde una consola para verificar que ingrese a Firestore y se pinte en tu Dashboard:

```bash
curl -X POST https://TU_CLOUD_FUNCTION_URL_AQUI \
  -H "Content-Type: application/json" \
  -H "x-api-key: loranode_secure_api_key_2026" \
  -d '{"deviceId": "esp32-simulado-01", "temperature": 27.2, "humidity": 59.5, "battery": 4.08, "rssi": -85, "snr": 8.5}'
```

Revisa tu base de datos Firestore tras ejecutar el comando; verás un nuevo documento creado en la colección `/telemetry` y `/devices`, y tu interfaz web mostrará los datos y la actualización del gráfico en tiempo real al instante.
