import { useEffect, useState } from "react";
import { db, getBookData, getBooks, getUserData } from "./firebase";
import { voidBookData, voidUserData } from "./constants";
import { Router } from "next/router";
import { useAccount } from "wagmi";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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
  }, [address, username, Router.events]);

  return userData;
}

export function useBooks(whereQuery = [], limitQuery = 20) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks(whereQuery, limitQuery).then((res) => setBooks(res));
  }, [whereQuery[2]]);
  return books;
}

export function useBookData(bookId) {
  const [bookData, setBookData] = useState(voidBookData);

  const getBookData = async (id) => {
    try {
      const docRef = doc(db, "books", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const { metadata: hash } = data;
        const metadata = await getMetadataFromHash(hash);
        return { ...data, ...metadata };
      } else {
        return voidBookData;
      }
    } catch (error) {
      return voidBookData;
    }
  };

  useEffect(() => {
    if (bookId != "new") {
      getBookData(bookId).then((res) => setBookData(res));
    }
  }, [bookId]);
  return bookData;
}
