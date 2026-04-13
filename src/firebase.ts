import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

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
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// هاد الجزء هو اللي كيخلي السيت يعقل عليك فالتليفون
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Persistence error:", error);
  });

// Force account selection only if needed
googleProvider.setCustomParameters({
  // حيدنا 'select_account' باش ميبقاش يبرزطك ديما إلا كنتي ديجا داخل
  hd: 'edu.umi.ac.ma' 
});

export default app;
