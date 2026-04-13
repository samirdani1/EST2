import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // رجعنا Firestore
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// ============================================================
// 🔥 CONFIGURATION FIREBASE - ESTM PORTAIL
// ============================================================
// Pour configurer votre propre projet Firebase :
// 1. Allez sur https://console.firebase.google.com
// 2. Créez un nouveau projet
// 3. Activez Authentication (Google Provider)
// 4. Activez Firestore Database
// 5. Activez Storage
// 6. Copiez votre config et remplacez ci-dessous
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDRlFZwIFCjtilAR_nsdEeixGR3etScw6A",
  authDomain: "estm-2f3a4.firebaseapp.com",
  projectId: "estm-2f3a4",
  storageBucket: "estm-2f3a4.firebasestorage.app",
  messagingSenderId: "344294752267",
  appId: "1:344294752267:web:6639ae02362f375169870e",
  measurementId: "G-KGL2C4630M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Services
export const auth = getAuth(app);
export const db = getFirestore(app); // رجعناها db ديال Firestore
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection each time
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'edu.umi.ac.ma' // Restrict to this domain in Google popup
});

export default app;
