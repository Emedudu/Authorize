import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, getBookData } from "./firebase";
import { voidBookData } from "./constants";

export function useUserData(username) {
  const [user] = useAuthState(auth);
  // const [displayName, setDisplayName] = useState("");
  // const [userPhoto, setUserPhoto] = useState(unknown);
  // const [userBio, setUserBio] = useState("");
  // const [userPhrase, setUserPhrase] = useState("");
  // const [userDescription, setUserDescription] = useState("");
  // const [userETH, setUserETH] = useState(null);
  // const [docId, setDocId] = (useState < null) | (string > "");

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;
    if (username) {
      if (username == "me") {
        if (user) {
          // const ref = firestore.collection("users").doc(user.uid);
          // unsubscribe = ref.onSnapshot((doc) => {
          //   if (doc.exists) {
          //     setDocId(doc?.id);
          //     setDisplayName(doc.data()?.username || "anonymous");
          //     setUserPhoto(
          //       doc.data()?.photoURL ||
          //         `https://avatars.dicebear.com/api/identicon/:${user.uid}.svg`
          //     );
          //     setUserBio(doc.data()?.bio || "");
          //     setUserPhrase(doc.data()?.phrase || "");
          //     setUserDescription(doc.data()?.description || "");
          //     setUserETH(doc.data()?.ethAddress);
          //   } else {
          //     setDocId(null);
          //   }
          // });
        }
      } else {
        // const query = firestore
        //   .collection("users")
        //   .where("username", "==", username.toLowerCase())
        //   .limit(1);
        // query.get().then((snapshot) => {
        //   const doc = snapshot.docs[0];
        //   if (doc) {
        //     setDocId(doc?.id);
        //     setDisplayName(doc.data()?.username || "anonymous");
        //     setUserPhoto(
        //       doc.data()?.photoURL ||
        //         `https://avatars.dicebear.com/api/identicon/:${doc.id}.svg`
        //     );
        //     setUserBio(doc.data()?.bio || "");
        //     setUserPhrase(doc.data()?.phrase || "");
        //     setUserDescription(doc.data()?.description || "");
        //     setUserETH(doc.data()?.ethAddress);
        //   } else {
        //     setDocId(null);
        //   }
        // });
      }
    }
    return unsubscribe;
  }, [user, username]);

  return {
    user,
    // username: displayName,
    // userPhoto,
    // userBio,
    // userPhrase,
    // userDescription,
    // userETH,
    // docId,
  };
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
