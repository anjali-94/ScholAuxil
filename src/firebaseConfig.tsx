// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChiUUt3YD8kQvkFkMsWdnofILPQW6Ps8Y",
  authDomain: "scholarauxil-1a121.firebaseapp.com",
  projectId: "scholarauxil-1a121",
  storageBucket: "scholarauxil-1a121.firebasestorage.app",
  messagingSenderId: "507212591124",
  appId: "1:507212591124:web:6bd2ed452e1ce7c58cb701",
  measurementId: "G-61Y8FBK4FX"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };