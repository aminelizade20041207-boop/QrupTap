import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDwXd_OkqSI1Y_nYYLvqt37cuwPBY1wtdU",
  authDomain: "studio-5815475421-d853d.firebaseapp.com",
  projectId: "studio-5815475421-d853d",
  storageBucket: "studio-5815475421-d853d.firebasestorage.app",
  messagingSenderId: "535350127210",
  appId: "1:535350127210:web:e6f2f58cb45597f4767813"
};

export function getFirebaseApp() {
  if (typeof window === "undefined") return null;

  return getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
}