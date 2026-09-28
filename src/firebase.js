import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBj_Lzlioc17bB2n2r2bTyt97oUr6Ok7D4",
  authDomain: "otian-s-calendar.firebaseapp.com",
  projectId: "otian-s-calendar",
  storageBucket: "otian-s-calendar.firebasestorage.app",
  messagingSenderId: "337542442891",
  appId: "1:337542442891:web:fd72b3dc724d8d217c498e",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
