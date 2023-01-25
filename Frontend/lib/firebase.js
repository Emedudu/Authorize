// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  getFirestore,
  getDoc,
} from "firebase/firestore";
import { voidBookData } from "./constants";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDthMUrG0YiXnKQGiBatht-5c4Oygx-xNw",
  authDomain: "authorize-155ed.firebaseapp.com",
  projectId: "authorize-155ed",
  storageBucket: "authorize-155ed.appspot.com",
  messagingSenderId: "661335197535",
  appId: "1:661335197535:web:00b904fdedb985685fd8ea",
  measurementId: "G-1ET5PHVPZY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// view functions
export const getBookData = async (id) => {
  try {
    const docRef = doc(db, "books", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return voidBookData;
    }
  } catch (error) {
    return voidBookData;
  }
};
