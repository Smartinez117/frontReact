import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvpSbZR1wyJ8COTh1UgcQ6-VmORazoWz8",
  authDomain: "redema-4b4ac.firebaseapp.com",
  projectId: "redema-4b4ac",
  storageBucket: "redema-4b4ac.firebasestorage.app",
  messagingSenderId: "732085429469",
  appId: "1:732085429469:web:4fc7fa774e18a2704a6734",
  measurementId: "G-SPB3E7QNBL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };