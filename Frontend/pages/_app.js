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
import { Router } from "next/router";
import { useEffect, useState } from "react";
import { configureChains, createClient, useAccount, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

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
    </div>
  );
}
