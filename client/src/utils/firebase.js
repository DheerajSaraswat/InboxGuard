// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpnuKm2c3d2HwLuFct_a9i3tii_WSlLjw",
  authDomain: "inboxguard-2b71a.firebaseapp.com",
  projectId: "inboxguard-2b71a",
  storageBucket: "inboxguard-2b71a.firebasestorage.app",
  messagingSenderId: "349315151933",
  appId: "1:349315151933:web:b55c84b7f1de82007f1254",
  measurementId: "G-QZJ1NBGDYB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
