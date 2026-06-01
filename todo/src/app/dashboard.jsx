import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";

import ScreenContainer from "../components/ui/ScreenContainer";
import AppButton from "../components/ui/AppButton";
import ErrorMessage from "../components/ui/ErrorMessage";
import LoadingState from "../components/ui/LoadingState";

import useRequireAuth from "../hooks/useRequireAuth";
import { auth } from "../lib/firebase";
import { logoutBackendSession } from "../api/authApi";

export default function Dashboard() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (err) {
      console.log("Error leyendo usuario local:", err);
    }
  }, []);

  const handleLogout = async () => {
    try {
      setError("");

      await logoutBackendSession();

      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("user");
      }

      await signOut(auth);

      router.replace("/login");
    } catch (err) {
      console.log("Error cerrando sesión:", err);
      setError("No se pudo cerrar sesión.");
    }
  };

  if (checkingAuth) {
    return (
      <ScreenContainer>
        <LoadingState message="Verificando sesión..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Todo App</Text>
          <Text style={styles.subtitle}>
            Organiza tus listas y tareas desde una app conectada a backend real.
          </Text>
        </View>

        <AppButton
          title="Cerrar sesión"
          variant="danger"
          onPress={handleLogout}
        />
      </View>

      <View style={styles.userCard}>
        <Text style={styles.cardLabel}>Sesión activa</Text>
        <Text style={styles.userEmail}>
          {user?.email || "Usuario autenticado"}
        </Text>
      </View>

      <ErrorMessage message={error} />

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mis listas</Text>
          <Text style={styles.cardText}>
            Crea, visualiza, edita y elimina tus listas de tareas.
          </Text>

          <AppButton
            title="Ir a listas"
            onPress={() => router.push("/lists")}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buscar</Text>
          <Text style={styles.cardText}>
            Encuentra listas o tareas por título y descripción.
          </Text>

          <AppButton
            title="Buscar tareas"
            onPress={() => router.push("/search")}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Perfil / About</Text>
          <Text style={styles.cardText}>
            Consulta la información del usuario y las tecnologías del proyecto.
          </Text>

          <AppButton
            title="Ver perfil"
            onPress={() => router.push("/profile")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 30,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    marginTop: 8,
    color: "#555",
    fontSize: 16,
    maxWidth: 620,
  },
  userCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardLabel: {
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  userEmail: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 14,
  },
});