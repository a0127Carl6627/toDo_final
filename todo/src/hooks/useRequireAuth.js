import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useRequireAuth() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem("APP_JWT");

        if (!token) {
          router.replace("/login");
          return;
        }
      } catch (error) {
        console.log("Error checking auth:", error);
        router.replace("/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  return {
    checkingAuth,
  };
}