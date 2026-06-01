import { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import ScreenContainer from "../components/ui/ScreenContainer";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import LoadingState from "../components/ui/LoadingState";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";

import useRequireAuth from "../hooks/useRequireAuth";

import { searchTodos } from "../api/searchApi";

export default function SearchScreen() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();

  const [query, setQuery] = useState("");
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      if (!query.trim()) {
        setError("Escribe algo para buscar.");
        return;
      }

      const data = await searchTodos(query.trim());

      setLists(data.lists || []);
      setTasks(data.tasks || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo realizar la búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setLists([]);
    setTasks([]);
    setError("");
  };

  const renderListResult = ({ item }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultType}>Lista</Text>
      <Text style={styles.resultTitle}>{item.title}</Text>

      {!!item.description && (
        <Text style={styles.resultDescription}>{item.description}</Text>
      )}

      <AppButton
        title="Ver detalle"
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: "/list-detail",
            params: {
              listId: item.id,
              title: item.title,
            },
          })
        }
      />
    </View>
  );

  const renderTaskResult = ({ item }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultType}>Tarea</Text>
      <Text
        style={[styles.resultTitle, item.completed && styles.completedTask]}
      >
        {item.title}
      </Text>

      {!!item.description && (
        <Text style={styles.resultDescription}>{item.description}</Text>
      )}

      <Text style={styles.meta}>
        Estado: {item.completed ? "Completada" : "Pendiente"}
      </Text>
    </View>
  );

  const hasResults = lists.length > 0 || tasks.length > 0;

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
          <Text style={styles.title}>Buscar</Text>
          <Text style={styles.subtitle}>
            Encuentra listas o tareas por título y descripción.
          </Text>
        </View>

        <AppButton
          title="Volver"
          variant="secondary"
          onPress={() => router.push("/dashboard")}
        />
      </View>

      <View style={styles.searchCard}>
        <AppInput
          placeholder="Buscar por ejemplo: escuela"
          value={query}
          onChangeText={setQuery}
        />

        <AppButton
          title={loading ? "Buscando..." : "Buscar"}
          onPress={handleSearch}
          disabled={loading}
        />

        <AppButton
          title="Limpiar"
          variant="secondary"
          onPress={clearSearch}
        />
      </View>

      <ErrorMessage message={error} />

      {loading && <LoadingState message="Buscando resultados..." />}

      {!loading && !hasResults && !error && (
        <EmptyState
          title="Sin resultados"
          description="Haz una búsqueda para encontrar tus listas o tareas."
        />
      )}

      {!loading && lists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listas encontradas</Text>

          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={renderListResult}
          />
        </View>
      )}

      {!loading && tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tareas encontradas</Text>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskResult}
          />
        </View>
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
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultType: {
    fontSize: 12,
    fontWeight: "800",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#777",
  },
  resultDescription: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#777",
  },
});