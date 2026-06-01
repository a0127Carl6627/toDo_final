import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./axios";

export async function createBackendSession(firebaseUser) {
  const firebaseToken = await firebaseUser.getIdToken();

  const response = await api.post("/auth/session", {
    firebaseToken,
  });

  const { token, user } = response.data;

  await AsyncStorage.setItem("APP_JWT", token);
  await AsyncStorage.setItem("APP_USER", JSON.stringify(user));

  return {
    token,
    user,
  };
}

export async function getCurrentBackendUser() {
  const response = await api.get("/auth/me");
  return response.data.user;
}

export async function logoutBackendSession() {
  await AsyncStorage.removeItem("APP_JWT");
  await AsyncStorage.removeItem("APP_USER");
}