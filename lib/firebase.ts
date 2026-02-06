import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCxDM15BlzdAkyK-71PTvjQoJurh7u8Yww",
  authDomain: "valt-8abe5.firebaseapp.com",
  projectId: "valt-8abe5",
  storageBucket: "valt-8abe5.firebasestorage.app",
  messagingSenderId: "986078002079",
  appId: "1:986078002079:web:966ed6594961bdcc8e5baa",
  measurementId: "G-FM4G6CW9R8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };
