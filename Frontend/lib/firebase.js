// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  query,
  where,
  getFirestore,
  getDoc,
  limit,
  doc,
} from "firebase/firestore";
import { voidBookData, voidUserData } from "./constants";
import { getMetadataFromHash } from "./helpers";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrlMIiUwdKEAHcmwPypU_0l6xL_pkNTEU",
  authDomain: "authorize-44073.firebaseapp.com",
  projectId: "authorize-44073",
  storageBucket: "authorize-44073.appspot.com",
  messagingSenderId: "793520914911",
  appId: "1:793520914911:web:6d09e2f0d5f6b4609ec46a",
  measurementId: "G-JZHX2EFS42",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// view functions
export const getUserData = async (username) => {
  if (username) {
    try {
      const docRef = query(
        collection(db, "users"),
        where("username", "==", username.toLowerCase()),
        limit(1)
      );
      const docSnap = await getDocs(docRef);
      let res = [];
      docSnap.forEach((doc) => {
        res.push(doc.data());
      });
      return res.length ? res[0] : voidBookData;
    } catch (error) {
      return voidUserData;
    }
  }
  return voidUserData;
};

export const getBooks = async (whereQuery, limitQuery) => {
  let docRef;
  if (whereQuery?.length == 3) {
    docRef = query(
      collection(db, "books"),
      where(whereQuery[0], whereQuery[1], whereQuery[2]),
      limit(limitQuery)
    );
  } else {
    docRef = query(collection(db, "books"), limit(limitQuery));
  }

  let res = [];
  const docSnap = await getDocs(docRef);

  docSnap.forEach((doc) => {
    res.push({ ...doc.data(), id: doc.id });
  });

  const result = Promise.all(
    res.map(async (obj) => {
      const { metadata: hash } = obj;
      const metadata = await getMetadataFromHash(hash);
      return { ...obj, ...metadata };
    })
  ).then((res) => res);

  return result;
};
