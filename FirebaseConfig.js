import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAPCz7wSG5yxkWtYt2FqodrNibympQy50",
  authDomain: "monitoringmotor-bb108.firebaseapp.com",
  databaseURL: "https://monitoringmotor-bb108-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoringmotor-bb108",
  storageBucket: "monitoringmotor-bb108.firebasestorage.app",
  messagingSenderId: "932527377732",
  appId: "1:932527377732:web:15a9df39051eaec6bb9b11"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
