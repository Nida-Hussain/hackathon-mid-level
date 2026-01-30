import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBm018R_zEsGU5_btM6xK9eNYXGBjbswzM",
  authDomain: "hackathon-3ce42.firebaseapp.com",
  projectId: "hackathon-3ce42",
  storageBucket: "hackathon-3ce42.firebasestorage.app",
  messagingSenderId: "223049640838",
  appId: "1:223049640838:web:6a6c5072c0ef3269e41a07",
  measurementId: "G-ETXMJTSQK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;