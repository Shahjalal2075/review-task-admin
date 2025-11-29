import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAB9uDeEWe0powXfI9oe-c46xEbmDB6SiA",
  authDomain: "iral-a71a3.firebaseapp.com",
  projectId: "iral-a71a3",
  storageBucket: "iral-a71a3.firebasestorage.app",
  messagingSenderId: "488006303860",
  appId: "1:488006303860:web:4af171625a78d03a50d121",
  measurementId: "G-6L5C1Y9GXF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;