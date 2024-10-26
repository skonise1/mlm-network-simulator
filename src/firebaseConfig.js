import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDEoGLHHaGOq0pnqJ0OnxC1b1rgNGGXtvA",
    authDomain: "mlm-nm.firebaseapp.com",
    projectId: "mlm-nm",
    storageBucket: "mlm-nm.appspot.com",
    messagingSenderId: "691722194505",
    appId: "1:691722194505:web:5249cf0d9fba735ccb7998",
    measurementId: "G-EL5J5S0PK9"
};
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
