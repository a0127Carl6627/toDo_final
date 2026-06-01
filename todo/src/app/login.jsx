import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { router } from "expo-router";

import { auth } from "../lib/firebase";
import { createBackendSession } from "../api/authApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMsg("");

      // 1. Login con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // 2. Mandar token de Firebase al backend
      // 3. Recibir JWT propio del backend
      const backendSession = await createBackendSession(firebaseUser);

      // 4. Guardar datos simples para usarlos en web
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          backendUserId: backendSession.user.id,
        })
      );

      setMsg("Login exitoso: " + firebaseUser.email);

      // 5. Ir al dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.log("Login error:", error);

      const backendMessage = error.response?.data?.message;

      setMsg(
        "Error: " +
          (backendMessage || error.message || "No se pudo iniciar sesión")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

      {msg ? <p>{msg}</p> : null}

      <footer>
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </footer>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 360,
    margin: "80px auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    fontFamily: "Arial, sans-serif",
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};