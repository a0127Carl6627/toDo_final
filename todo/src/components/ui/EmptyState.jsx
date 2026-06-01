import { View, Text, StyleSheet } from "react-native";

export default function EmptyState({
  title = "No hay elementos",
  description = "Cuando agregues información, aparecerá aquí.",
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});