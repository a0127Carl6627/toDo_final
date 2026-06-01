import { Text, StyleSheet } from "react-native";

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontWeight: "600",
  },
});