import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import ScreenContainer from "../components/ui/ScreenContainer";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import LoadingState from "../components/ui/LoadingState";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import ListCard from "../components/todo/ListCard";

import useRequireAuth from "../hooks/useRequireAuth";

import {
  getLists,
  createList,
  updateList,
  deleteList,
} from "../api/listsApi";

export default function ListsScreen() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();

  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingList, setEditingList] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLists = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLists();

      setLists(data);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudieron cargar las listas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      loadLists();
    }
  }, [checkingAuth]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditingList(null);
  };

  const handleSaveList = async () => {
    try {
      setSaving(true);
      setError("");

      if (!title.trim()) {
        setError("El título de la lista es obligatorio.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
      };

      if (editingList) {
        await updateList(editingList.id, payload);
      } else {
        await createList(payload);
      }

      resetForm();
      await loadLists();
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo guardar la lista.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setTitle(list.title || "");
    setDescription(list.description || "");
  };

  const handleDeleteList = async (listId) => {
    try {
      setError("");

      const shouldDelete =
        typeof window !== "undefined"
          ? window.confirm("¿Seguro que quieres eliminar esta lista?")
          : true;

      if (!shouldDelete) return;

      await deleteList(listId);

      if (editingList?.id === listId) {
        resetForm();
      }

      await loadLists();
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError("No se pudo eliminar la lista.");
    }
  };

  const goToListDetail = (list) => {
    router.push({
      pathname: "/list-detail",
      params: {
        listId: list.id,
        title: list.title,
      },
    });
  };

  const renderList = ({ item }) => (
    <ListCard
      list={item}
      onPress={() => goToListDetail(item)}
      onEdit={() => handleEditList(item)}
      onDelete={() => handleDeleteList(item.id)}
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
          <Text style={styles.title}>Mis listas</Text>
          <Text style={styles.subtitle}>
            Crea, edita y administra tus listas de tareas.
          </Text>
        </View>

        <AppButton
          title="Volver"
          variant="secondary"
          onPress={() => router.push("/dashboard")}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingList ? "Editar lista" : "Nueva lista"}
        </Text>

        <AppInput
          placeholder="Título de la lista"
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
              : editingList
              ? "Actualizar lista"
              : "Crear lista"
          }
          onPress={handleSaveList}
          disabled={saving}
        />

        {editingList && (
          <AppButton
            title="Cancelar edición"
            variant="secondary"
            onPress={resetForm}
          />
        )}
      </View>

      <ErrorMessage message={error} />

      {loading && <LoadingState message="Cargando listas..." />}

      {!loading && lists.length === 0 && (
        <EmptyState
          title="No tienes listas"
          description="Crea tu primera lista para empezar a organizar tus tareas."
        />
      )}

      {!loading && lists.length > 0 && (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderList}
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

