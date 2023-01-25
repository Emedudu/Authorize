import express from "express";
const app = express();
const port = 5001;
import ethers, { utils } from "ethers";
import ABI from "./abi/Test.json";
import axios from "axios";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
const wallaby = {
  id: 31415,
  name: "Filecoin — Wallaby testnet",
  network: "wallaby",
  nativeCurrency: {
    decimals: 18,
    name: "Testnet Filecoin",
    symbol: "tFil",
  },
  rpcUrls: {
    default: { http: ["https://wallaby.node.glif.io/rpc/v0"] },
  },
  blockExplorers: {
    default: { name: "Glif", url: "https://explorer.glif.io/wallaby" },
  },
  testnet: true,
};
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.hyperspace.node.glif.io/rpc/v1",
  3141
);

const contract = new ethers.Contract(ABI.address, ABI.abi, provider);

const filter = {
  address: ABI.address,
  topics: [
    // the name of the event, parnetheses containing the data type of each event, no spaces
    utils.id("Added(address)"),
  ],
};

provider.once("block", () => {
  try {
    contract.on(filter, (num, ...event) => {
      axios.post("http://localhost:3000/api/hello", JSON.stringify(event), {
        headers: { "Content-Type": "application/json" },
      });
      console.log("num", num);
      console.log("event", event);
      return () => {
        contract.removeAllListeners();
      };
    });
  } catch (error) {
    console.log("error");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
