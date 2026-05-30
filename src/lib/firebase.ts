import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuRQk3RGmUsOLw7eR7QzyFSK7R_qM_f8A",
  authDomain: "manhwavault-dc461.firebaseapp.com",
  projectId: "manhwavault-dc461",
  storageBucket: "manhwavault-dc461.firebasestorage.app",
  messagingSenderId: "65976887861",
  appId: "1:65976887861:web:80dd2548a8b91dbdc01f7c",
  measurementId: "G-PXP66J0R7J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
