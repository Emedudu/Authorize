import { useEffect, useState } from "react";
import { db, getBookData, getUserData } from "./firebase";
import { voidBookData, voidUserData } from "./constants";
import { useAccount } from "wagmi";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { getMetadataFromHash } from "./helpers";

export function useUserData(username) {
  const { address } = useAccount();

  const [userData, setUserData] = useState(voidUserData);

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;
    if (username && username == "me") {
      if (address) {
        const docRef = doc(db, "users", address);
        getDoc(docRef).then((res) => {
          // do some destructuring here with userData
          if (res.exists()) setUserData(res.data());
        });
      }
    } else {
      if (username) {
        getUserData(username).then((res) => setUserData(res));
      }
    }

    return unsubscribe;
  }, [address, username]);

  return userData;
}

export function useBooks() {
  const [books, setBooks] = useState([]);

  const getBooks = async () => {
    const docRef = query(collection(db, "books"));
    let res = [];
    const docSnap = await getDocs(docRef);

    docSnap.forEach((doc) => {
      // const { metadata: hash } = doc.data();
      // const metadata = await getMetadataFromHash(hash);
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

  useEffect(() => {
    getBooks().then((res) => setBooks(res));
  }, []);
  return books;
}

export function useBookData(bookId) {
  const [bookData, setBookData] = useState(voidBookData);
  useEffect(() => {
    if (bookId != "new") {
      getBookData(bookId).then((res) => setBookData(res));
    }
  }, [bookId]);
  return bookData;
}
