import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import ScreenContainer from "../components/ui/ScreenContainer";
import AppButton from "../components/ui/AppButton";
import LoadingState from "../components/ui/LoadingState";
import ErrorMessage from "../components/ui/ErrorMessage";

import useRequireAuth from "../hooks/useRequireAuth";

import { getCurrentBackendUser, logoutBackendSession } from "../api/authApi";

export default function ProfileScreen() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();

  const [user, setUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setLocalUser(JSON.parse(storedUser));
      }

      const backendUser = await getCurrentBackendUser();

      setUser(backendUser);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      loadProfile();
    }
  }, [checkingAuth]);

  const handleLogout = async () => {
    try {
      await logoutBackendSession();

      localStorage.removeItem("user");

      router.replace("/login");
    } catch (err) {
      console.log(err);
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
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>
            Información de sesión y descripción del proyecto.
          </Text>
        </View>

        <AppButton
          title="Volver"
          variant="secondary"
          onPress={() => router.push("/dashboard")}
        />
      </View>

      <ErrorMessage message={error} />

      {loading && <LoadingState message="Cargando perfil..." />}

      {!loading && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Usuario autenticado</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Correo Firebase:</Text>
              <Text style={styles.value}>
                {localUser?.email || user?.email || "No disponible"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>UID Firebase:</Text>
              <Text style={styles.value}>
                {localUser?.uid || user?.firebase_uid || "No disponible"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ID Backend:</Text>
              <Text style={styles.value}>
                {user?.id || localUser?.backendUserId || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>

            <Text style={styles.paragraph}>
              Esta aplicación permite gestionar listas de tareas usando Expo,
              Firebase Authentication, un backend propio con Express, JWT para
              autorización y una base de datos PostgreSQL en Neon.
            </Text>

            <Text style={styles.paragraph}>
              El flujo de autenticación inicia con Firebase. Después, el token
              de Firebase se envía al backend, donde se valida con Firebase
              Admin. El backend genera un JWT propio que se utiliza para acceder
              a las rutas protegidas de listas, tareas y búsqueda.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tecnologías utilizadas</Text>

            <Text style={styles.bullet}>• Expo / React Native</Text>
            <Text style={styles.bullet}>• Expo Router</Text>
            <Text style={styles.bullet}>• Firebase Authentication</Text>
            <Text style={styles.bullet}>• Axios con interceptors</Text>
            <Text style={styles.bullet}>• Node.js + Express</Text>
            <Text style={styles.bullet}>• JWT</Text>
            <Text style={styles.bullet}>• PostgreSQL / Neon</Text>
          </View>

          <AppButton
            title="Cerrar sesión"
            variant="danger"
            onPress={handleLogout}
          />
        </>
      )}
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
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
  },
  subtitle: {
    marginTop: 6,
    color: "#555",
    fontSize: 15,
    maxWidth: 460,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  value: {
    fontSize: 15,
    color: "#111",
  },
  paragraph: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
  },
});