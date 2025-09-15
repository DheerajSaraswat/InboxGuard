import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "inboxguard-2b71a.firebaseapp.com",
  projectId: "inboxguard-2b71a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "349315151933",
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: "G-QZJ1NBGDYB",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const googleAuth = async (rememberMe) => {
  try {
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistence);

    console.log("Google Authentication.....");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const token = await getIdToken(user, true);
    toast.success("Google sign-in successful!");
    return {
      accessToken: token,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid,
      username:user.username
    };
  } catch (error) {
    // console.error("Google Auth error:", error);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(userCredential);
    const user = userCredential.user;
    const token = await getIdToken(user, true);
    await sendEmailVerification(user);
    toast.success("Verification email sent!");
    return {
      accessToken: token,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid,
      username: user.username,
    };
  } catch (error) {
    console.log(error);
    toast.error(error.message || "Registration failed.");
    throw error;
  }
};

export const login = async (email, password, rememberMe) => {
  try {
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;
    await setPersistence(auth, persistence);
    console.log(email ,"   ----   ", password);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    if (!user.emailVerified) {
      throw new Error(
        "Email not verified. Please verify your email before logging in."
      );
    }
    
    const token = await getIdToken(user, true);

    toast.success("Login successful!");
    return {
      accessToken: token,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid,
      username: user.username,
    };
  } catch (error) {
    // console.log(error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent!");
  } catch (error) {
    console.log(error);
    toast.error(error.message || "Failed to send password reset email.");
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
    toast.success("Logged out successfully!");
  } catch (error) {
    console.log(error);
    toast.error(error.message || "Logout failed.");
    throw error;
  }
};
