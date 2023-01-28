import { useEffect, useState } from "react";
import { db, getBookData, getUserData } from "./firebase";
import { voidBookData, voidUserData } from "./constants";
import { useAccount } from "wagmi";
import { doc, getDoc } from "firebase/firestore";

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

export function useBookData(bookId) {
  const [bookData, setBookData] = useState(voidBookData);
  useEffect(() => {
    if (bookId != "new") {
      getBookData(bookId).then((res) => setBookData(res));
    }
  }, [bookId]);
  return bookData;
}
