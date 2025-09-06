import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "inboxguard-2b71a.firebaseapp.com",
  projectId: "inboxguard-2b71a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "349315151933",
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: "G-QZJ1NBGDYB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const googleAuth = async () => {
  try {
    console.log("Google Authentication.....");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      accessToken: user.accessToken,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const register = async(email, password) =>{
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(userCredential);
    const user = userCredential.user;
    await sendEmailVerification(user);
    alert("Email sent for verifiction!!")
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const login = async(email, password)=>{
  try {
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const user = userCredential.user;
    console.log(user);
    if(!user.emailVerified){
      throw new Error("Email not verified. Please verify your email before logging in.");
    }
    return {
      accessToken: user.accessToken,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };

  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const resetPassword = async(email) =>{
  try {
    const emailSent = await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.log(error);
    throw error;
  }
}