// The Firebase compat library from the CDN must be imported as a namespace.
// The namespace itself is the main firebase object that gets augmented by the other compat imports.
// FIX: Changed `import * as firebase` to `import firebase` to correctly import the default export from `firebase/compat/app`.
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