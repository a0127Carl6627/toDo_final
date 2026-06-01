import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function AppButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === "danger" && styles.dangerButton,
        variant === "secondary" && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: "#7f1d1d",
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryText: {
    color: "#111",
  },
});