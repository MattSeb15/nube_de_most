import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDuUNsw0z7esPtBa64VzrswrjAunRawgoo",
  authDomain: "nube-de-most.firebaseapp.com",
  projectId: "nube-de-most",
  storageBucket: "nube-de-most.firebasestorage.app",
  messagingSenderId: "183330978920",
  appId: "1:183330978920:web:48b1b36bbf9939e01f0fdd",
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export { app, storage };
