
// FIX: Use firebase v8 compat imports to resolve module errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { GoogleAuthProvider } from "firebase/auth";

// Using the provided Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyB2pogcorcfxBgQPgJ7QDHCVsfGo7Icz_Y",
  authDomain: "kangen-share-app.firebaseapp.com",
  projectId: "kangen-share-app",
  storageBucket: "kangen-share-app.appspot.com",
  messagingSenderId: "1047550398612",
  appId: "1:1047550398612:web:f92446e948583e271d2481",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
