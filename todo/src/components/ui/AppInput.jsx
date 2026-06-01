import { TextInput, StyleSheet } from "react-native";

export default function AppInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
}) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline]}
      placeholderTextColor="#777"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});