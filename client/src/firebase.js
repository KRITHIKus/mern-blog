

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-8c56f.firebaseapp.com",
  projectId: "mern-blog-8c56f",
  storageBucket: "mern-blog-8c56f.firebasestorage.app",
  messagingSenderId: "466583762858",
  appId: "1:466583762858:web:4b1f43845273deb0a61dd3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
