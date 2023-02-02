import { useEffect, useState } from "react";
import { db, getBookData, getUserData } from "./firebase";
import { voidBookData, voidUserData } from "./constants";
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
  }, [address, username]);

  return userData;
}

export function useBooks(whereQuery = [], limitQuery = 20) {
  const [books, setBooks] = useState([]);

  const getBooks = async (whereQuery, limitQuery) => {
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
