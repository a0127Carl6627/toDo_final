import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
          ]}
        >
          <Text style={styles.checkText}>
            {task.completed ? "✓" : ""}
          </Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>

          {!!task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}

          {task.due_date && (
            <Text style={styles.meta}>
              Fecha límite: {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
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
    </View>
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: "#111",
  },
  checkText: {
    color: "#fff",
    fontWeight: "900",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#777",
  },
  description: {
    marginTop: 5,
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