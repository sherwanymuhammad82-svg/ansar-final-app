import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJ2qFOfIlb_uBTlKig9XrxI8GJuil5JMc",
  authDomain: "roshnay-f3c05.firebaseapp.com",
  projectId: "roshnay-f3c05",
  storageBucket: "roshnay-f3c05.firebasestorage.app",
  messagingSenderId: "1051309656715",
  appId: "1:1051309656715:web:81f20ec235af02c60fe28e",
  measurementId: "G-0LBTBEYGK5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
