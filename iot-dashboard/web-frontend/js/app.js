import { watchAuthState, loginWithGoogle, logoutUser } from "./auth.js";
import { db, collection, query, orderBy, limit, onSnapshot } from "./firebase-config.js";

// Estado global de la aplicación
const appState = {
  user: null,
  telemetryData: [],
  unsubscribeTelemetry: null,
  activeChart: null
};

// Elementos de la UI
const appContainer = document.getElementById("app");
const navItems = document.querySelectorAll(".nav-item");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.getElementById("navMenu");

// Inicialización de la aplicación
function init() {
  // Configurar menú móvil
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      mobileMenuBtn.classList.toggle("active");
    });
  }

  // Escuchar cambios de ruta por hash
  window.addEventListener("hashchange", handleRouting);
  
  // Escuchar estado de autenticación de Firebase
  watchAuthState((user) => {
    appState.user = user;
    
    // Si el usuario cambia, re-evaluar la suscripción de datos
    setupTelemetrySubscription();
    
    // Forzar enrutamiento en la página actual
    handleRouting();
  });
}

// Configurar o limpiar la escucha de datos en tiempo real de Firestore
function setupTelemetrySubscription() {
  // Si hay una suscripción activa previa, cancelarla
  if (appState.unsubscribeTelemetry) {
    appState.unsubscribeTelemetry();
    appState.unsubscribeTelemetry = null;
  }

  // Solo nos suscribimos si el usuario está autenticado y Firestore está listo
  if (appState.user && db) {
    const q = query(
      collection(db, "telemetry"), 
      orderBy("timestamp", "desc"), 
      limit(50)
    );
    
    appState.unsubscribeTelemetry = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        // Convertir server timestamp a objeto Date JS
        const date = docData.timestamp ? docData.timestamp.toDate() : new Date();
        data.push({
          id: doc.id,
          ...docData,
          dateObj: date,
          formattedDate: date.toLocaleString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })
        });
      });
      appState.telemetryData = data;
      
      // Si estamos en la página del Dashboard o Historial, refrescar la vista local
      const currentRoute = getRoute();
      if (currentRoute === "dashboard") {
        renderDashboardView();
      } else if (currentRoute === "data") {
        renderDataView();
      }
    }, (error) => {
      console.error("Error en suscripción de telemetría:", error);
    });
  } else {
    // Si no hay sesión o no hay db, vaciar datos locales
    appState.telemetryData = [];
  }
}

// Obtener ruta limpia desde el hash
function getRoute() {
  const hash = window.location.hash || "#/";
  if (hash === "#/" || hash === "") return "landing";
  if (hash === "#/login") return "login";
  if (hash === "#/dashboard") return "dashboard";
  if (hash === "#/data") return "data";
  return "landing"; // Fallback
}

// Enrutador SPA
function handleRouting() {
  const route = getRoute();
  
  // Cerrar menú móvil al navegar
  if (navMenu && navMenu.classList.contains("open")) {
    navMenu.classList.remove("open");
    mobileMenuBtn.classList.remove("active");
  }

  // Actualizar clases activas del navbar
  navItems.forEach(item => {
    const itemRoute = item.getAttribute("data-route");
    if (itemRoute === route) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Protección de rutas privadas
  const privateRoutes = ["dashboard", "data"];
  if (privateRoutes.includes(route) && !appState.user) {
    console.log(`Intento de acceso a ruta privada ${route} sin autenticación. Redireccionando a login.`);
    window.location.hash = "#/login";
    return;
  }

  // Renderizar la vista correspondiente
  switch (route) {
    case "landing":
      renderLandingView();
      break;
    case "login":
      renderLoginView();
      break;
    case "dashboard":
      renderDashboardView();
      break;
    case "data":
      renderDataView();
      break;
    default:
      renderLandingView();
  }
}

// =========================================================================
// RENDERIZADO DE VISTAS (PÁGINAS)
// =========================================================================

// VISTA 1: LANDING PAGE
function renderLandingView() {
  appContainer.innerHTML = `
    <div class="landing-view animate-fade-in">
      <section class="hero">
        <div class="hero-content">
          <span class="hero-tag">Tecnología LoRaWAN & ESP32</span>
          <h1>Monitoreo Industrial <span>En Tiempo Real</span></h1>
          <p>Plataforma telemétrica inteligente para visualizar y analizar variables críticas desde nodos remotos ESP32. Optimizado para transmisión de baja potencia y gran alcance en redes LoRaWAN.</p>
          <div class="hero-actions">
            ${appState.user 
              ? `<a href="#/dashboard" class="btn-primary">Ir al Dashboard</a>`
              : `<a href="#/login" class="btn-primary">Empezar Prototipo</a>`
            }
            <a href="#info-detalles" class="btn-secondary" id="learnMoreBtn">Ver Arquitectura</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="iot-node-mockup">
            <div class="mockup-header">
              <div class="node-status">
                <span class="pulse-dot"></span>
                <span>ESP32 Activo</span>
              </div>
              <span class="node-signal">RSSI: -98 dBm</span>
            </div>
            <div class="mockup-body">
              <div class="mockup-metric">
                <span class="mockup-label">Temperatura</span>
                <span class="mockup-value">26.4<span class="unit">°C</span></span>
              </div>
              <div class="mockup-metric">
                <span class="mockup-label">Humedad</span>
                <span class="mockup-value">58.7<span class="unit">% HR</span></span>
              </div>
              <div class="mockup-metric">
                <span class="mockup-label">Batería</span>
                <span class="mockup-value">4.12<span class="unit">V</span></span>
              </div>
            </div>
            <div class="mockup-footer">
              <span>Última transmisión: Hace un momento</span>
            </div>
          </div>
        </div>
      </section>

      <section class="features-section" id="info-detalles">
        <h2 class="section-title">Características Clave de nuestro Prototipo</h2>
        <div class="features-grid">
          <div class="feature-card glass-panel">
            <div class="feature-icon-wrapper">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3>Bajo Consumo</h3>
            <p>El nodo ESP32 utiliza algoritmos de Deep Sleep avanzados, despertándose periódicamente para transmitir datos a través de LoRa, logrando autonomía de meses o años con baterías estándar.</p>
          </div>

          <div class="feature-card glass-panel">
            <div class="feature-icon-wrapper">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3>Gran Alcance (LoRaWAN)</h3>
            <p>Utilizando modulación de espectro ensanchado, las señales viajan a kilómetros de distancia incluso en entornos industriales con interferencias, superando con creces al WiFi tradicional.</p>
          </div>

          <div class="feature-card glass-panel">
            <div class="feature-icon-wrapper">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Seguridad Integrada</h3>
            <p>Autenticación fuerte con Google Auth para el acceso web, Cloud Functions seguras para la recepción y cifrado nativo AES-128 de extremo a extremo propio del protocolo LoRaWAN.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Añadir scroll suave al botón "Ver Arquitectura"
  const learnMoreBtn = document.getElementById("learnMoreBtn");
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#info-detalles").scrollIntoView({ behavior: "smooth" });
    });
  }
}

// VISTA 2: LOGIN / REGISTRO
function renderLoginView() {
  // Si el usuario ya está autenticado, redirigir al dashboard
  if (appState.user) {
    window.location.hash = "#/dashboard";
    return;
  }

  appContainer.innerHTML = `
    <div class="login-view animate-fade-in">
      <div class="login-card glass-panel">
        <div class="login-header">
          <h2>Acceso Plataforma</h2>
          <p>Identifícate para interactuar con tus dispositivos de telemetría IoT.</p>
        </div>
        
        <button class="btn-google" id="googleLoginBtn">
          <!-- Icono de Google SVG -->
          <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Ingresar con Google
        </button>

        <p class="login-info">Para el prototipo de desarrollo, la autenticación de Google asegura que solo los desarrolladores y operadores autorizados tengan acceso a la lectura de datos confidenciales del ESP32.</p>
      </div>
    </div>
  `;

  // Vincular click del botón de login
  const loginBtn = document.getElementById("googleLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      loginBtn.disabled = true;
      loginBtn.innerHTML = `<div class="loader" style="width: 20px; height: 20px; border-width: 2px;"></div> Autenticando...`;
      try {
        await loginWithGoogle();
        window.location.hash = "#/dashboard";
      } catch (error) {
        alert("Ocurrió un error al iniciar sesión. Revisa tu consola y la configuración de Firebase.");
        renderLoginView(); // Reset
      }
    });
  }
}

// VISTA 3: DATA LOGS (Tabla de variables)
function renderDataView() {
  const currentCount = appState.telemetryData.length;
  
  appContainer.innerHTML = `
    <div class="data-view animate-fade-in">
      <div class="page-header">
        <div>
          <h2>Historial de Telemetría</h2>
          <p>Tabla completa con los últimos registros de variables posteadas por tus dispositivos.</p>
        </div>
        <div class="table-controls">
          <div class="badge-device">Registros: ${currentCount}</div>
        </div>
      </div>

      <div class="glass-panel">
        <div class="table-container">
          <table class="telemetry-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>ID Dispositivo</th>
                <th>Temp. (°C)</th>
                <th>Hum. (% HR)</th>
                <th>Batería (V)</th>
                <th>Señal RSSI (dBm)</th>
                <th>Calidad SNR (dB)</th>
              </tr>
            </thead>
            <tbody id="telemetryTableBody">
              ${renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Generar filas de la tabla
function renderTableRows() {
  if (appState.telemetryData.length === 0) {
    return `
      <tr>
        <td colspan="7" class="no-data-row">
          No hay datos disponibles en Firestore. Envía un reporte desde el ESP32 para visualizarlo aquí.
        </td>
      </tr>
    `;
  }

  return appState.telemetryData.map(row => {
    const data = row.data || {};
    return `
      <tr>
        <td><strong>${row.formattedDate}</strong></td>
        <td><span class="badge-device">${row.deviceId || "ESP32-Node"}</span></td>
        <td>${data.temperature !== undefined ? data.temperature.toFixed(1) : "-"} °C</td>
        <td>${data.humidity !== undefined ? data.humidity.toFixed(1) : "-"} %</td>
        <td>${data.battery !== undefined ? data.battery.toFixed(2) : "-"} V</td>
        <td><span style="color: ${data.rssi > -95 ? 'var(--accent-green)' : 'var(--accent-red)'}">${data.rssi || "-"}</span> dBm</td>
        <td>${data.snr !== undefined ? data.snr.toFixed(1) : "-"} dB</td>
      </tr>
    `;
  }).join("");
}

// VISTA 4: DASHBOARD (Variables y Gráficos)
function renderDashboardView() {
  // Obtener última medición (los datos están en orden descendente)
  const latestDoc = appState.telemetryData[0];
  const latestData = latestDoc ? latestDoc.data : {};
  
  appContainer.innerHTML = `
    <div class="dashboard-view animate-fade-in">
      <div class="page-header">
        <div>
          <h2>Panel de Monitoreo IoT</h2>
          <p>Visualización del estado actual y comportamiento histórico del nodo ESP32.</p>
        </div>
        <div class="status-indicator">
          <span class="status-dot ${latestDoc ? 'online' : 'offline'}"></span>
          <span>${latestDoc ? 'Dispositivo Activo' : 'Sin Datos'}</span>
        </div>
      </div>

      <!-- Grid de Tarjetas de Métricas -->
      <div class="dashboard-grid">
        <!-- Tarjeta Temperatura -->
        <div class="glass-panel metric-card">
          <div class="metric-header">
            <span>Temperatura</span>
            <div class="metric-icon temperature">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
          </div>
          <div class="value">
            ${latestData.temperature !== undefined ? latestData.temperature.toFixed(1) : "--"}
            <span class="unit">°C</span>
          </div>
          <div class="metric-trend">Valor actual en tiempo real</div>
        </div>

        <!-- Tarjeta Humedad -->
        <div class="glass-panel metric-card">
          <div class="metric-header">
            <span>Humedad</span>
            <div class="metric-icon humidity">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </div>
          <div class="value">
            ${latestData.humidity !== undefined ? latestData.humidity.toFixed(1) : "--"}
            <span class="unit">% HR</span>
          </div>
          <div class="metric-trend">Humedad Relativa del aire</div>
        </div>

        <!-- Tarjeta Batería -->
        <div class="glass-panel metric-card">
          <div class="metric-header">
            <span>Voltaje Batería</span>
            <div class="metric-icon battery">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
          </div>
          <div class="value">
            ${latestData.battery !== undefined ? latestData.battery.toFixed(2) : "--"}
            <span class="unit">V</span>
          </div>
          <div class="metric-trend" style="color: ${latestData.battery > 3.6 ? 'var(--accent-green)' : 'var(--accent-red)'}">
            ${latestData.battery ? (latestData.battery > 3.6 ? 'Carga Óptima' : 'Batería Baja') : 'Sin info'}
          </div>
        </div>

        <!-- Tarjeta Señal RSSI -->
        <div class="glass-panel metric-card">
          <div class="metric-header">
            <span>Calidad Señal LoRa</span>
            <div class="metric-icon signal">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
          </div>
          <div class="value">
            ${latestData.rssi !== undefined ? latestData.rssi : "--"}
            <span class="unit">dBm</span>
          </div>
          <div class="metric-trend">SNR: ${latestData.snr !== undefined ? latestData.snr + ' dB' : '-- dB'}</div>
        </div>
      </div>

      <!-- Sección de Gráficos e Info de Dispositivo -->
      <div class="charts-grid">
        <!-- Gráfico del Histórico -->
        <div class="glass-panel chart-panel">
          <div class="chart-panel-header">
            <h3>Gráfico de Tendencia Histórica</h3>
            <span class="badge-device">Últimos 15 reportes</span>
          </div>
          <div class="chart-container">
            <canvas id="telemetryChart"></canvas>
          </div>
        </div>

        <!-- Info y Metadata del Dispositivo -->
        <div class="glass-panel device-status-panel">
          <h3 style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 600;">Metadatos del Nodo</h3>
          <div class="device-info-list">
            <div class="device-info-item">
              <span>ID del Dispositivo</span>
              <span>${latestDoc ? latestDoc.deviceId : '--'}</span>
            </div>
            <div class="device-info-item">
              <span>Frecuencia LoRa</span>
              <span>915 MHz (US915)</span>
            </div>
            <div class="device-info-item">
              <span>Última Conexión</span>
              <span style="font-size: 0.8rem;">${latestDoc ? latestDoc.formattedDate : '--'}</span>
            </div>
            <div class="device-info-item">
              <span>Mensajes Recibidos</span>
              <span>${appState.telemetryData.length}</span>
            </div>
            <div class="device-info-item">
              <span>Estado Ingesta</span>
              <span style="color: var(--accent-cyan)">Webhook Activo</span>
            </div>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-top: auto;">Los datos provienen de un nodo físico ESP32 transmitiendo mediante protocolo LoRaWAN. El servidor de red redirige el payload en tiempo real a Firebase Cloud Functions, la cual procesa e ingresa los registros en esta base de datos Firestore de alta velocidad.</p>
        </div>
      </div>
    </div>
  `;

  // Construir el gráfico utilizando Chart.js
  buildChart();
}

// Inicializar / Construir el Gráfico
function buildChart() {
  const canvas = document.getElementById("telemetryChart");
  if (!canvas) return;

  // Si ya existía un gráfico en este estado de la app, destruirlo para evitar superposición
  if (appState.activeChart) {
    appState.activeChart.destroy();
    appState.activeChart = null;
  }

  // Preparar datos (necesitamos ordenarlos cronológicamente para el gráfico)
  // Tomamos los últimos 15 registros y los invertimos para que vayan del más antiguo al más nuevo
  const recentData = [...appState.telemetryData].slice(0, 15).reverse();
  
  if (recentData.length === 0) {
    // Si no hay datos, pintar un texto en el canvas
    const ctx = canvas.getContext("2d");
    ctx.font = "14px Inter";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText("Esperando que ingresen reportes del sensor en Firestore...", canvas.width / 2, canvas.height / 2);
    return;
  }

  const labels = recentData.map(d => d.dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
  const temperatures = recentData.map(d => d.data?.temperature || null);
  const humidities = recentData.map(d => d.data?.humidity || null);

  const ctx = canvas.getContext("2d");
  
  appState.activeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temperatures,
          borderColor: '#ff3838',
          backgroundColor: 'rgba(255, 56, 56, 0.08)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'yTemp',
          fill: true
        },
        {
          label: 'Humedad (% HR)',
          data: humidities,
          borderColor: '#00f2fe',
          backgroundColor: 'rgba(0, 242, 254, 0.08)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'yHum',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 12 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter' } }
        },
        yTemp: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Temperatura (°C)', color: '#ff3838', font: { family: 'Outfit', weight: 'bold' } },
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94a3b8' }
        },
        yHum: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Humedad (% HR)', color: '#00f2fe', font: { family: 'Outfit', weight: 'bold' } },
          // Evitar dibujar líneas de rejilla duplicadas en el eje secundario
          grid: { drawOnChartArea: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

// Iniciar aplicación
document.addEventListener("DOMContentLoaded", init);
init(); // Asegurar inicialización por si ya cargó DOM
export { appState };
