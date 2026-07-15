// SCRIPT LOGIC - NETWORK PORTFOLIO SPA

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initIntersectionObserver();
  initDataJourneySimulator();
  initGlossaryTabs();
  initTerminalSimulator();
});

/* -------------------------------------------------------------
   NAVBAR & RESPONSIVE MENU
------------------------------------------------------------- */
function initNavbar() {
  const header = document.getElementById('mainHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-item');

  // Change style of header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    updateActiveNavItem();
  });

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close Mobile Menu on Click of a nav link
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
  
  // Update Active navigation item according to section scroll position
  function updateActiveNavItem() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        const currentId = section.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${currentId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }
}

/* -------------------------------------------------------------
   INTERSECTION OBSERVER (Fade-In Animado)
------------------------------------------------------------- */
function initIntersectionObserver() {
  const sections = document.querySelectorAll('.fade-in-section');
  
  const options = {
    threshold: 0.12,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, options);
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

/* -------------------------------------------------------------
   SECCIÓN 2: SIMULADOR EL VIAJE DEL DATO
------------------------------------------------------------- */
function initDataJourneySimulator() {
  const btnSend = document.getElementById('btnSend');
  const userMessageInput = document.getElementById('userMessage');
  const inspectOutput = document.getElementById('inspectOutput');
  
  // Step Cards
  const stepApp = document.getElementById('step-app');
  const stepTrans = document.getElementById('step-trans');
  const stepNet = document.getElementById('step-net');
  const stepPhys = document.getElementById('step-phys');
  
  let animationTimeout = null;
  
  btnSend.addEventListener('click', () => {
    // Clear previous timeouts if button clicked repeatedly
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    
    const message = userMessageInput.value.trim() || "¡Hola, Redes!";
    startJourneyAnimation(message);
  });
  
  function startJourneyAnimation(message) {
    // Reset all step states
    const steps = [stepApp, stepTrans, stepNet, stepPhys];
    steps.forEach(step => {
      step.classList.remove('active', 'completed');
    });
    
    inspectOutput.innerHTML = `<p class="highlight-cyan">// Iniciando travesía de red...</p>`;
    
    // STEP 1: Capa de Aplicación
    stepApp.classList.add('active');
    printInspectorMessage(1, message);
    
    // Timer to step 2
    animationTimeout = setTimeout(() => {
      stepApp.classList.remove('active');
      stepApp.classList.add('completed');
      stepTrans.classList.add('active');
      printInspectorMessage(2, message);
      
      // Timer to step 3
      animationTimeout = setTimeout(() => {
        stepTrans.classList.remove('active');
        stepTrans.classList.add('completed');
        stepNet.classList.add('active');
        printInspectorMessage(3, message);
        
        // Timer to step 4
        animationTimeout = setTimeout(() => {
          stepNet.classList.remove('active');
          stepNet.classList.add('completed');
          stepPhys.classList.add('active');
          printInspectorMessage(4, message);
          
          // Finish animation
          animationTimeout = setTimeout(() => {
            stepPhys.classList.remove('active');
            stepPhys.classList.add('completed');
            
            inspectOutput.innerHTML += `<p class="highlight-green" style="margin-top: 1rem;">[+] TRANSMISIÓN EXITOSA: El paquete ha llegado al destino y ha sido desencapsulado.</p>`;
            scrollInspectorToBottom();
          }, 2500);
          
        }, 2500);
        
      }, 2500);
      
    }, 2500);
  }
  
  function printInspectorMessage(step, rawMessage) {
    let html = '';
    
    switch(step) {
      case 1:
        // Cifrado HTTPS / Protocolo TLS
        const cipher = stringToHex(rawMessage);
        html = `
          <p><span class="highlight-cyan">[CAPA DE APLICACIÓN - HTTP/HTTPS/TLS]</span></p>
          <p class="text-muted">Procesando el mensaje en el navegador web...</p>
          <p>• <strong>Texto Plano:</strong> "${rawMessage}"</p>
          <p>• <strong>Cifrado SSL/TLS (Simulado):</strong> <span class="highlight-green">${cipher.substring(0, 32)}...</span></p>
          <p>• <strong>Cabeceras HTTP Inyectadas:</strong></p>
          <p class="text-muted" style="padding-left: 1rem;">
            GET /api/send HTTP/2<br>
            Host: danbenet.dev<br>
            Content-Type: application/json<br>
            User-Agent: NetBrowser/1.0
          </p>
          <p class="highlight-cyan">&gt;&gt; Enviando cabeceras a la capa inferior de transporte...</p>
        `;
        inspectOutput.innerHTML = html;
        break;
        
      case 2:
        // Segmentación TCP
        const chunks = chunkString(rawMessage, 3);
        html = `
          <p><span class="highlight-cyan">[CAPA DE TRANSPORTE - TCP]</span></p>
          <p class="text-muted">Dividiendo el bloque de datos cifrados en segmentos TCP para un transporte confiable...</p>
          <p>• <strong>Puerto Origen (Dinamico):</strong> 54321 | <strong>Puerto Destino (HTTPS):</strong> 443</p>
          <p>• <strong>Segmentación de datos:</strong></p>
        `;
        
        chunks.forEach((chunk, i) => {
          html += `<p style="padding-left: 1rem;">- <strong>Segmento #${i+1}:</strong> "${chunk}" (Secuencia: ${1000 + i*100}, Ack: 0)</p>`;
        });
        
        html += `
          <p>• <strong>Control de flujo:</strong> TCP Three-way handshake establecido con éxito [SYN, SYN-ACK, ACK].</p>
          <p class="highlight-cyan">&gt;&gt; Transfiriendo segmentos ordenados a la capa de red...</p>
        `;
        inspectOutput.innerHTML += html;
        break;
        
      case 3:
        // Direccionamiento IP (Capa de Red)
        html = `
          <p style="margin-top: 1rem;"><span class="highlight-cyan">[CAPA DE RED - IP]</span></p>
          <p class="text-muted">Envolviendo cada segmento en un paquete IP y adjuntando direcciones postales digitales...</p>
          <p>• <strong>IP de Origen (Tu red local):</strong> 192.168.1.15</p>
          <p>• <strong>IP de Destino (Servidor Web):</strong> 8.8.8.8</p>
          <p>• <strong>TTL (Time To Live):</strong> 64 saltos máximos de routers antes de descartar.</p>
          <p>• <strong>Enrutamiento lógico:</strong> El router local calcula la ruta más corta usando OSPF. Siguiente salto (Gateway): 192.168.1.1.</p>
          <p class="highlight-cyan">&gt;&gt; Empujando paquetes IP formateados a la interfaz física...</p>
        `;
        inspectOutput.innerHTML += html;
        break;
        
      case 4:
        // Capa física (Medios)
        const binary = stringToBinary(rawMessage.substring(0, 4));
        html = `
          <p style="margin-top: 1rem;"><span class="highlight-cyan">[CAPA FÍSICA - MEDIOS DE TRANSMISIÓN]</span></p>
          <p class="text-muted">Codificando la cabecera IP y datos en impulsos electromagnéticos en los cables físicos...</p>
          <p>• <strong>Medio Activo:</strong> Fibra Óptica (pulsos de luz láser a 1310nm)</p>
          <p>• <strong>Flujo binario serializado (Primeros caracteres):</strong></p>
          <p class="highlight-green" style="word-break: break-all; padding-left: 1rem; font-size: 0.8rem; letter-spacing: 2px;">
            ${binary}...
          </p>
          <p>• <strong>Física de transmisión:</strong> Modulación láser transportando bits a través del cable transatlántico en el lecho marino.</p>
        `;
        inspectOutput.innerHTML += html;
        break;
    }
    
    scrollInspectorToBottom();
  }
  
  function scrollInspectorToBottom() {
    const inspectBody = inspectOutput.parentElement;
    inspectBody.scrollTop = inspectBody.scrollHeight;
  }
  
  // Helpers
  function stringToHex(str) {
    let hex = '';
    for(let i=0; i<str.length; i++) {
      hex += str.charCodeAt(i).toString(16);
    }
    return hex;
  }
  
  function stringToBinary(str) {
    let binary = '';
    for(let i=0; i<str.length; i++) {
      let bin = str.charCodeAt(i).toString(2);
      binary += "0".repeat(8 - bin.length) + bin + " ";
    }
    return binary.trim();
  }
  
  function chunkString(str, count) {
    const len = Math.ceil(str.length / count);
    const chunks = [];
    for (let i = 0; i < str.length; i += len) {
      chunks.push(str.substring(i, i + len));
    }
    return chunks;
  }
}

/* -------------------------------------------------------------
   SECCIÓN 4: GLOSARIO VISUAL (PESTAÑAS)
------------------------------------------------------------- */
function initGlossaryTabs() {
  const tabs = document.querySelectorAll('.glossary-tab');
  const panes = document.querySelectorAll('.glossary-pane');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      
      // Remove active states
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-expanded', 'false');
      });
      panes.forEach(p => p.classList.remove('active'));
      
      // Set active current states
      tab.classList.add('active');
      tab.setAttribute('aria-expanded', 'true');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

/* -------------------------------------------------------------
   SECCIÓN 5: MI TERMINAL / CONSOLA INTERACTIVA
------------------------------------------------------------- */
function initTerminalSimulator() {
  const terminalInput = document.getElementById('terminalInput');
  const consoleScreen = document.getElementById('consoleScreen');
  const consoleHistory = document.getElementById('consoleHistory');
  const terminalCursor = document.getElementById('terminalCursor');
  const suggestionButtons = document.querySelectorAll('.btn-command-suggestion');
  
  // Terminal commands handling
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      terminalInput.value = '';
      if (command) {
        executeCommand(command);
      }
    }
  });

  // Suggestion buttons click handler
  suggestionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-cmd');
      if (command === 'clear') {
        clearTerminal();
      } else {
        simulateTypingAndExecute(command);
      }
    });
  });
  
  // Focusing input on terminal screen click
  consoleScreen.addEventListener('click', () => {
    terminalInput.focus();
  });
  
  function simulateTypingAndExecute(command) {
    terminalInput.value = '';
    terminalInput.disabled = true;
    terminalCursor.style.display = 'block';
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < command.length) {
        terminalInput.value += command.charAt(index);
        index++;
        // Position cursor at the end
        const valLen = terminalInput.value.length;
        terminalCursor.style.left = (valLen * 8) + 'px';
      } else {
        clearInterval(interval);
        terminalCursor.style.display = 'none';
        terminalInput.disabled = false;
        terminalInput.value = '';
        executeCommand(command);
        terminalInput.focus();
      }
    }, 60);
  }
  
  function executeCommand(cmd) {
    // Add command to history view
    const cmdLine = document.createElement('div');
    cmdLine.className = 'history-item';
    cmdLine.innerHTML = `
      <div class="history-cmd">
        <span class="console-prompt">danbe@NetEngineer:~$</span>
        <span>${cmd}</span>
      </div>
    `;
    consoleHistory.appendChild(cmdLine);
    
    // Parse command
    const sanitizedCmd = cmd.toLowerCase().trim();
    let output = '';
    
    if (sanitizedCmd === 'whoami' || sanitizedCmd === 'run whoami') {
      output = `
<strong>Nombre:</strong> Danbe (Redes y Ciberseguridad)
<strong>Rol:</strong> Ingeniero de Infraestructura y Enrutamiento Core
<strong>Pasión:</strong> Conectar el mundo digital, diseñar topologías de datos robustas,
        y garantizar redes con cero caídas y máxima redundancia.
<strong>Stack Técnico:</strong> Cisco IOS, OSPF, BGP, VLANS, Firewalls, Python Scripting, Wireshark.
      `;
      printOutputSlowly(cmdLine, output);
    } 
    else if (sanitizedCmd === 'show ip interface brief') {
      output = `
<table class="iface-table">
  <thead>
    <tr>
      <th>Interface</th>
      <th>IP-Address</th>
      <th>OK?</th>
      <th>Method</th>
      <th>Status</th>
      <th>Protocol</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GigabitEthernet0/1 (WAN)</td>
      <td>200.45.10.15</td>
      <td>YES</td>
      <td>DHCP</td>
      <td class="highlight-green">up</td>
      <td class="highlight-green">up</td>
    </tr>
    <tr>
      <td>GigabitEthernet0/2 (LAN)</td>
      <td>192.168.1.1</td>
      <td>YES</td>
      <td>manual</td>
      <td class="highlight-green">up</td>
      <td class="highlight-green">up</td>
    </tr>
    <tr>
      <td>Vlan10 (Proyectos)</td>
      <td>10.10.10.1</td>
      <td>YES</td>
      <td>manual</td>
      <td class="highlight-green">up</td>
      <td class="highlight-green">up</td>
    </tr>
    <tr>
      <td>Vlan20 (Laboratorios)</td>
      <td>10.20.20.1</td>
      <td>YES</td>
      <td>manual</td>
      <td class="highlight-cyan">down</td>
      <td class="highlight-cyan">down</td>
    </tr>
  </tbody>
</table>
<br>
<strong>Proyectos Destacados en esta Interfaz:</strong>
• <a href="https://github.com/Snayder505" target="_blank" class="highlight-cyan">Redes LAN / Packet Tracer</a> (Simulación a gran escala)
• <a href="https://github.com/Snayder505" target="_blank" class="highlight-cyan">Firewall PFSense Casero</a> (Seguridad perimetral y túneles VPN)
• <a href="https://github.com/Snayder505" target="_blank" class="highlight-cyan">Automatización Cisco en Python</a> (Deploy masivo de switches)
      `;
      printOutputSlowly(cmdLine, output);
    } 
    else if (sanitizedCmd === 'ping -c 4 contact_me') {
      simulatePing(cmdLine);
    } 
    else if (sanitizedCmd === 'clear') {
      clearTerminal();
    } 
    else if (sanitizedCmd === 'help') {
      output = `
Comandos disponibles en este sistema sandbox:
  - <strong>run whoami</strong> : Muestra perfil profesional.
  - <strong>show ip interface brief</strong> : Muestra lista de interfaces y enlaces a proyectos.
  - <strong>ping -c 4 contact_me</strong> : Muestra canales de contacto.
  - <strong>clear</strong> : Limpia el buffer de pantalla de la terminal.
  - <strong>help</strong> : Muestra este listado.
      `;
      printOutputSlowly(cmdLine, output);
    } 
    else {
      output = `<span class="text-danger">Error: Comando no reconocido.</span> Escribe 'help' o usa los accesos rápidos de abajo.`;
      printOutputSlowly(cmdLine, output);
    }
  }
  
  function printOutputSlowly(parentDiv, text) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'history-output';
    parentDiv.appendChild(outputDiv);
    
    // Inyectamos el texto directo para elementos con HTML complejo como tablas o enlaces
    // pero con un pequeño fade para simular tiempo de respuesta de red
    setTimeout(() => {
      outputDiv.innerHTML = text;
      scrollTerminalToBottom();
    }, 200);
  }
  
  function simulatePing(parentDiv) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'history-output';
    parentDiv.appendChild(outputDiv);
    
    let seq = 1;
    outputDiv.innerHTML = `<p>PING contact_me (10.99.99.99) 56(84) bytes of data.</p>`;
    scrollTerminalToBottom();
    
    const interval = setInterval(() => {
      if (seq <= 4) {
        outputDiv.innerHTML += `<p>64 bytes from contact_me (10.99.99.99): icmp_seq=${seq} ttl=64 time=${(Math.random() * 8 + 8).toFixed(1)} ms</p>`;
        scrollTerminalToBottom();
        seq++;
      } else {
        clearInterval(interval);
        outputDiv.innerHTML += `
          <p>--- contact_me ping statistics ---</p>
          <p>4 packets transmitted, 4 received, 0% packet loss, time 3004ms</p>
          <p class="highlight-cyan" style="margin-top:0.5rem;">[+] Canales de enlace directos disponibles:</p>
          <div class="social-links-grid">
            <a href="https://linkedin.com" target="_blank" class="social-card">
              <span>🔗 LinkedIn</span>
            </a>
            <a href="https://github.com/Snayder505" target="_blank" class="social-card">
              <span>💻 GitHub</span>
            </a>
            <a href="mailto:danbe@netengineer.dev" class="social-card">
              <span>✉️ Email</span>
            </a>
          </div>
        `;
        scrollTerminalToBottom();
      }
    }, 400);
  }
  
  function clearTerminal() {
    consoleHistory.innerHTML = '';
    scrollTerminalToBottom();
  }
  
  function scrollTerminalToBottom() {
    consoleScreen.scrollTop = consoleScreen.scrollHeight;
  }
}
