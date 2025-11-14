// FIX: Changed from a namespace import (`import * as firebase`) to a default import.
// The `firebase/compat/app` package provides a default export that is augmented
// by the side-effect imports for other services (auth, firestore, etc.).
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

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
// This check prevents errors on hot reloads.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Export the augmented firebase namespace to be used for types and static properties across the app
export { firebase };