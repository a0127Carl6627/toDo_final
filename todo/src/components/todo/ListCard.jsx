import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ListCard({
  list,
  onPress,
  onEdit,
  onDelete,
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title}>{list.title}</Text>

          {!!list.description && (
            <Text style={styles.description}>{list.description}</Text>
          )}

          <Text style={styles.meta}>
            {list.task_count || 0} tareas · {list.completed_count || 0} completadas
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} style={styles.dangerButton}>
          <Text style={styles.dangerText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#777",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryText: {
    color: "#111",
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dangerText: {
    color: "#991b1b",
    fontWeight: "700",
  },
});