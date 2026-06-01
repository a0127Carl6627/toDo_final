import { ActivityIndicator, Text, View, StyleSheet } from "react-native";

export default function LoadingState({ message = "Cargando..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "#555",
    fontSize: 14,
  },
});