import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { router } from "expo-router";

import { auth } from "../lib/firebase";
import { createBackendSession } from "../api/authApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMsg("");

      // 1. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // 2. Crear sesión en tu backend
      const backendSession = await createBackendSession(firebaseUser);

      // 3. Guardar datos simples para web
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          backendUserId: backendSession.user.id,
        })
      );

      setMsg("Registro exitoso: " + firebaseUser.email);

      // 4. Ir al dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.log("Register error:", error);

      const backendMessage = error.response?.data?.message;

      setMsg(
        "Error: " +
          (backendMessage || error.message || "No se pudo registrar")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} style={styles.form}>
      <h2>Registro</h2>

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
        {loading ? "Registrando..." : "Registrarme"}
      </button>

      {msg ? <p>{msg}</p> : null}

      <footer>
        <p>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
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