import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { LoaderContext, UserContext } from "@/lib/context";
import { useUserData } from "@/lib/hooks";
import "@/styles/globals.css";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { ethers, utils } from "ethers";
import { Router } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { configureChains, createClient, useAccount, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import bookABI from "@/abi/Book.json";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// blockExplorerUrl:https://hyperspace.filfox.info
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
    default: {
      name: "Glif",
      url: "https://explorer.glif.io/?network=hyperspace",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [hyperspace],
  [
    walletConnectProvider({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    }),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== hyperspace.id) return null;
        return chain.rpcUrls.default;
      },
    }),
  ]
);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "web3Modal", chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

const eventProvider = new ethers.providers.JsonRpcProvider(
  "https://api.hyperspace.node.glif.io/rpc/v1",
  3141
);

const bookContract = new ethers.Contract(
  bookABI.address,
  bookABI.abi,
  eventProvider
);

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

eventProvider.once("block", () => {
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

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Router.events.on("routeChangeStart", () => setLoading(true));
    Router.events.on("routeChangeComplete", () => setLoading(false));
    Router.events.on("routeChangeError", () => setLoading(false));
    return () => {
      Router.events.off("routeChangeStart", () => setLoading(true));
      Router.events.off("routeChangeComplete", () => setLoading(false));
      Router.events.off("routeChangeError", () => setLoading(false));
    };
  }, [Router.events]);

  const userData = useUserData("me");
  const [loading, setLoading] = useState(false);

  return (
    <div
      className={`${
        loading ? "h-screen" : "min-h-screen"
      } font-mono bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#eacda3] via-[#f4e2d8] to-[#d6ae7b] overflow-hidden`}
    >
      <WagmiConfig client={wagmiClient}>
        <UserContext.Provider value={userData}>
          <LoaderContext.Provider value={{ loading, setLoading }}>
            {loading ? (
              <Loader />
            ) : (
              <>
                <Navbar />
                <div className="min-h-[calc(100vh-108px)]">
                  <Component {...pageProps} />
                </div>
                <Footer />
              </>
            )}
          </LoaderContext.Provider>
        </UserContext.Provider>
      </WagmiConfig>
      <Web3Modal
        projectId={process.env.NEXT_PUBLIC_WALLET_CONNECT_ID}
        ethereumClient={ethereumClient}
        themeColor="orange"
        themeBackground="themeColor"
      />
      <Toaster />
    </div>
  );
}
