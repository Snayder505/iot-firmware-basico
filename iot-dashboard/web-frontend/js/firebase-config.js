// Configuración e Inicialización de Firebase SDK v10 (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =========================================================================
// REEMPLAZA ESTA CONFIGURACIÓN CON LAS CREDENCIALES DE TU PROYECTO FIREBASE
// Puedes obtenerlas en: Consola de Firebase -> Ajustes de Proyecto -> General
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBDO1nOyjLClypFpZ_ZRuQfAttTL1bFKIM",
  authDomain: "iot-dashboard-a64e8.firebaseapp.com",
  projectId: "iot-dashboard-a64e8",
  storageBucket: "iot-dashboard-a64e8.firebasestorage.app",
  messagingSenderId: "186002496041",
  appId: "1:186002496041:web:6d9075738e22898abb1a38",
  measurementId: "G-MBGVT82HVY"
};

// Inicializar Firebase
let app;
let auth;
let db;

try {
  // Comprobar si las credenciales fueron reemplazadas.
  // Si no, podemos inicializar con valores demo o capturar el error amigablemente.
  if (firebaseConfig.apiKey === "TU_API_KEY_AQUI") {
    console.warn("⚠️ Firebase: Usando credenciales de prueba. Reemplaza la configuración en 'js/firebase-config.js' para conectarlo a tu base de datos real.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error al inicializar Firebase. Comprueba la configuración de tu proyecto.", error);
}

// Proveedor de Autenticación de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
};
