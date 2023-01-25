import Head from "next/head";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import abi from "@/abi/Test.json";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
export default function Home() {
  const { config } = usePrepareContractWrite({
    address: abi.address,
    abi: abi.abi,
    chainId: 3141,
    functionName: "add",
    args: [],
  });

  const { data, isLoading, error, isError, write } = useContractWrite(config);
  return (
    <>
      <Head>
        <title>AUTHORize</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Web3Button />
        <button onClick={write}>add</button>
      </main>
    </>
  );
}
