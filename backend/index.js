import express from "express";
const app = express();
const port = process.env.PORT;
import ethers, { BigNumber, utils } from "ethers";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const testABI = require("./abi/Test.json"); // use the require method
const bookABI = require("./abi/Book.json");
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
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const hyperspace = {
  id: 3141,
  name: "Filecoin — Hyperspace testnet",
  network: "hyperspace",
  nativeCurrency: {
    decimals: 18,
    name: "Testnet Filecoin",
    symbol: "tFil",
  },
  rpcUrls: {
    default: { http: ["https://api.hyperspace.node.glif.io/rpc/v1"] },
  },
  blockExplorers: {
    default: { name: "Glif", url: "https://hyperspace.filfox.info" },
  },
  testnet: true,
};

const provider = new ethers.providers.JsonRpcProvider(
  "https://api.hyperspace.node.glif.io/rpc/v1",
  3141
);

const testContract = new ethers.Contract(
  testABI.address,
  testABI.abi,
  provider
);
const bookContract = new ethers.Contract(
  bookABI.address,
  bookABI.abi,
  provider
);

const testFilterAdd = {
  address: testABI.address,
  topics: [
    // the name of the event, parnetheses containing the data type of each event, no spaces
    utils.id("Added(address)"),
  ],
};

const bookFilterCreate = {
  address: bookABI.address,
  topics: [
    // the name of the event, parnetheses containing the data type of each event, no spaces
    utils.id("BookCreated(address,string,uint256)"),
  ],
};

const bookFilterUpload = {
  address: bookABI.address,
  topics: [
    // the name of the event, parnetheses containing the data type of each event, no spaces
    utils.id("BookPublished(uint256,uint256,uint256)"),
  ],
};

provider.once("block", () => {
  try {
    testContract.on(testFilterAdd, (num, ...event) => {
      console.log("num", num);
      console.log("event", event);
      return () => {
        testContract.removeAllListeners();
      };
    });
  } catch (error) {
    console.log("error");
  }

  try {
    bookContract.on(bookFilterCreate, async (num, ...event) => {
      // console.log("num", num);
      // console.log("event", event);

      const deleteDocRef = doc(db, "books", event[0]);
      const docSnap = await getDoc(deleteDocRef);

      let book;
      if (docSnap.exists()) {
        book = docSnap.data();
        await deleteDoc(deleteDocRef);
        const saveDocRef = doc(db, "books", event[1].toString());
        await setDoc(saveDocRef, book);
      }

      return () => {
        bookContract.removeAllListeners();
      };
    });
  } catch (error) {
    console.log("error");
  }

  try {
    bookContract.on(bookFilterUpload, async (num, ...event) => {
      // console.log("num", num);
      // console.log("event", event);

      const docRef = doc(db, "books", num.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          purchasePrice: ethers.utils.formatEther(event[0]),
          rentPrice: ethers.utils.formatEther(event[1]),
        });
      }

      return () => {
        bookContract.removeAllListeners();
      };
    });
  } catch (error) {
    console.log("error");
  }
});

app.listen(port || 5001, () => {
  console.log(`Example app listening on port ${port || 5001}`);
});
