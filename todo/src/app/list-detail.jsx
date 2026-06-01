import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ScreenContainer from "../components/ui/ScreenContainer";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import LoadingState from "../components/ui/LoadingState";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import TaskCard from "../components/todo/TaskCard";

import useRequireAuth from "../hooks/useRequireAuth";

import {
  getTasksByList,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasksApi";

export default function ListDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { checkingAuth } = useRequireAuth();

  const listId = params.listId;
  const listTitle = params.title || "Detalle de lista";

  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      if (!listId) {
        setError("No se encontró el ID de la lista.");
        return;
      }

      const data = await getTasksByList(listId);
      setTasks(data);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      loadTasks();
    }
  }, [checkingAuth, listId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    try {
      setSaving(true);
      setError("");

      if (!title.trim()) {
        setError("El título de la tarea es obligatorio.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
      };

      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(listId, payload);
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo guardar la tarea.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
  };

  const handleToggleTask = async (task) => {
    try {
      setError("");

      await updateTask(task.id, {
        completed: !task.completed,
      });

      await loadTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo actualizar el estado de la tarea.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setError("");

      const shouldDelete =
        typeof window !== "undefined"
          ? window.confirm("¿Seguro que quieres eliminar esta tarea?")
          : true;

      if (!shouldDelete) return;

      await deleteTask(taskId);

      if (editingTask?.id === taskId) {
        resetForm();
      }

      await loadTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo eliminar la tarea.");
    }
  };

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onToggle={() => handleToggleTask(item)}
      onEdit={() => handleEditTask(item)}
      onDelete={() => handleDeleteTask(item.id)}
    />
  );

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
          <Text style={styles.title}>{listTitle}</Text>
          <Text style={styles.subtitle}>
            Administra las tareas pertenecientes a esta lista.
          </Text>
        </View>

        <AppButton
          title="Volver"
          variant="secondary"
          onPress={() => router.push("/lists")}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingTask ? "Editar tarea" : "Nueva tarea"}
        </Text>

        <AppInput
          placeholder="Título de la tarea"
          value={title}
          onChangeText={setTitle}
        />

        <AppInput
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <AppButton
          title={
            saving
              ? "Guardando..."
              : editingTask
              ? "Actualizar tarea"
              : "Crear tarea"
          }
          onPress={handleSaveTask}
          disabled={saving}
        />

        {editingTask && (
          <AppButton
            title="Cancelar edición"
            variant="secondary"
            onPress={resetForm}
          />
        )}
      </View>

      <ErrorMessage message={error} />

      {loading && <LoadingState message="Cargando tareas..." />}

      {!loading && tasks.length === 0 && (
        <EmptyState
          title="No hay tareas"
          description="Crea la primera tarea de esta lista."
        />
      )}

      {!loading && tasks.length > 0 && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
        />
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
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },
  listContent: {
    paddingBottom: 30,
  },
});