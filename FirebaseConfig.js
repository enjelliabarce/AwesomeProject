import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAPCz7wSG5yxkWtYt2Fqodr0NibympQy50",
    authDomain: "monitoringmotor-bb108.firebaseapp.com",
    databaseURL: "https://monitoringmotor-bb108-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "monitoringmotor-bb108",
    storageBucket: "monitoringmotor-bb108.firebasestorage.app",
    messagingSenderId: "932527377732",
    appId: "1:932527377732:web:15a9df39051eae6cbb9b11",
    measurementId: "G-8MTBDX6T5F"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app); // 