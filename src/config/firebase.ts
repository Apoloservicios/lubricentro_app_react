// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDeV4w2nGcV5dDUO6awYz0ZUA-r3uMMnno",
  authDomain: "hismaw-bf1d5.firebaseapp.com",
  projectId: "hismaw-bf1d5",
  storageBucket: "hismaw-bf1d5.firebasestorage.app",
  messagingSenderId: "1018414685470",
  appId: "1:1018414685470:web:b2c2794c661f85834b3d0f",
  measurementId: "G-QE1QF7DEES"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;