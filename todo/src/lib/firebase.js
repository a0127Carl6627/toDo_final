import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDiXa05MZZn52Ok0UXO9CaUnG011UVs9FI",
  authDomain: "todo-3a160.firebaseapp.com",
  projectId: "todo-3a160",
  storageBucket: "todo-3a160.firebasestorage.app",
  messagingSenderId: "199208870562",
  appId: "1:199208870562:web:679a722013c4e53fd8adfb",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

export { app, auth };