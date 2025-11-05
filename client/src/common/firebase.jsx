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
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import toast from "react-hot-toast";
import api from "../utils/api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app)

const provider = new GoogleAuthProvider();

export const auth = getAuth();

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
    console.error("Google Auth error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Google sign-in failed. Please try again.";
    
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in popup was closed. Please try again.";
    } else if (error.code === "auth/unauthorized-domain") {
      errorMessage = "This domain is not authorized. Please contact support.";
      console.error("Unauthorized domain. Make sure inboxguard.live is added to Firebase Console authorized domains.");
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage = "Popup was blocked. Please allow popups for this site and try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
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

export const requestForToken = async()=>{
  try {
    const permission = await Notification.requestPermission();
    if(permission === "granted"){
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPIDKEY,
      });
      if(currentToken){
        console.log("FCM Token: ", currentToken);
        await api.post("/users/update-fcm-token",{
          token: currentToken
        })
        return currentToken
      } else {
        console.warn("No registration token available. Request permission.");
      }
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (error) {
    console.error("An error occurred while retreiving token: ", error);
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    // This listener fires when the user is actively using your website.
    onMessage(messaging, (payload) => {
      console.log("Foreground Message Received:", payload);
      // Manually handle the display (e.g., show a toast or an in-app banner)
      // The browser's native notification will NOT show in the foreground.
      resolve(payload);
    });
  });