import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBjmjZ3Y_lwauEIlyA-2aNMn8uU2-8c_tg",
    authDomain: "task-manager-87055.firebaseapp.com",
    projectId: "task-manager-87055",
    storageBucket: "task-manager-87055.firebasestorage.app",
    messagingSenderId: "249152253154",
    appId: "1:249152253154:web:f3a4a5660d9cec7b3002bb",
    measurementId: "G-GHE0HME7S2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); 