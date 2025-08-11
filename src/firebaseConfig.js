import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAk-WhXUmp4XtMnpXWPab1r-caJxIZ0CPg",
  authDomain: "tp2-appweb-7b184.firebaseapp.com",
  projectId: "tp2-appweb-7b184",
  storageBucket: "tp2-appweb-7b184.firebasestorage.app",
  messagingSenderId: "529701461011",
  appId: "1:529701461011:web:a7f56ce5b7278ff18cf3e6",
  measurementId: "G-7Q1M90KTJR"
};

  // Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fonction pour la connexion avec Google
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user;
  } catch (error) {
    console.error("Erreur de connexion avec Google:", error.message);
    return null;
  }
};

// Exporter l'auth et la fonction signInWithGoogle
export { auth, signInWithGoogle, createUserWithEmailAndPassword, signInWithEmailAndPassword };
export const googleProvider = new GoogleAuthProvider();
