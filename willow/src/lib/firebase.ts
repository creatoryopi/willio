import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "automated-bonus-xwjrd",
  appId: "1:968953548235:web:282144d2ac43f618677a4e",
  apiKey: "AIzaSyCdCcBENOWs1GFF_LpQ9QC1DRip7ScilwI",
  authDomain: "automated-bonus-xwjrd.firebaseapp.com",
  storageBucket: "automated-bonus-xwjrd.firebasestorage.app",
  messagingSenderId: "968953548235"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Named (non-default) Firestore database for this project. This ID is fixed —
// it's the actual database that already holds your data, so don't rename it.
const db = getFirestore(app, "ai-studio-recallai-a5bc3ac5-5790-4a15-88c7-80402e2b621c");
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

export { auth, db, storage };
