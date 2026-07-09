import { 
  auth, 
  db,
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc,
  setDoc,
  serverTimestamp
} from "./firebase-config.js";

// Función para iniciar sesión con Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Guardar/actualizar la información del usuario en Firestore
    await saveUserToFirestore(user);
    
    console.log("Usuario autenticado con éxito:", user.displayName);
    return user;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    throw error;
  }
}

// Función para cerrar sesión
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("Sesión cerrada.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    throw error;
  }
}

// Guardar los datos del usuario en la colección `/users`
async function saveUserToFirestore(user) {
  if (!db) return;
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error al guardar usuario en Firestore:", error);
  }
}

// Escuchar cambios en el estado de autenticación de forma reactiva
export function watchAuthState(callback) {
  if (!auth) {
    // Si Firebase no está configurado correctamente, pasamos un usuario nulo
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
    callback(user);
  });
}

// Actualiza los elementos del menú de navegación basados en el estado de autenticación
function updateAuthUI(user) {
  const authBtn = document.getElementById("authBtn");
  const privateRoutes = document.querySelectorAll(".private-route");

  if (user) {
    // Usuario logueado
    if (authBtn) {
      authBtn.textContent = "Salir";
      authBtn.classList.remove("nav-btn");
      authBtn.classList.add("nav-btn-logout"); // Podemos darle estilos de botón de salida
      // Cambiar comportamiento a logout
      authBtn.onclick = async (e) => {
        e.preventDefault();
        await logoutUser();
        window.location.hash = "#/";
      };
    }
    
    // Mostrar las rutas privadas
    privateRoutes.forEach(el => el.classList.remove("hidden"));
  } else {
    // Usuario no logueado
    if (authBtn) {
      authBtn.textContent = "Ingresar";
      authBtn.classList.remove("nav-btn-logout");
      authBtn.classList.add("nav-btn");
      authBtn.onclick = (e) => {
        e.preventDefault();
        window.location.hash = "#/login";
      };
    }
    
    // Ocultar rutas privadas
    privateRoutes.forEach(el => el.classList.add("hidden"));
  }
}
