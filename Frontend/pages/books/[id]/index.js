import Head from "next/head";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import abi from "@/abi/Test.json";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useBookData } from "@/lib/hooks";
import Image from "next/image";
import bookABI from "@/abi/Book.json";
import { ethers } from "ethers";
// import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  const { address } = useAccount();

  const bookData = useBookData(id);

  const { config: configToPurchase } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "buyAccess",
    args: [parseInt(id)],
    overrides: {
      value: ethers.utils.parseEther(bookData?.purchasePrice?.toString() || 0),
    },
    onSettled: (data, error) => {
      console.log({ data, error });
    },
  });

  const {
    data: purchaseData,
    isLoading: purchaseIsLoading,
    error: purchaseError,
    isError: purchaseIsError,
    isSuccess: purchaseIsSuccess,
    write: purchase,
  } = useContractWrite(configToPurchase);

  useWaitForTransaction({
    hash: purchaseData?.hash,
    onSettled(data, error) {
      console.log(data, error);
    },
  });

  const {
    data: isBookAccessible,
    isError,
    isLoading,
  } = useContractRead({
    address: bookABI.address,
    abi: bookABI.abi,
    functionName: "canAccessBook",
    args: [parseInt(id), address],
    onSettled(data, error) {
      console.log(data, error);
    },
  });

  return (
    <>
      <Head>
        <title>AUTHORize</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col space-y-5 p-4">
        <div className="p-2 text-2xl capitalize font-semibold text-center text-gray-700">
          {bookData.name}
        </div>
        <div className="flex max-h-[calc(100vh-156px)] space-x-5">
          <div className="flex items-center justify-center">
            <div className="relative h-96 w-64">
              <Image
                src={`https://gateway.lighthouse.storage/ipfs/${bookData.imageHash}`}
                fill={true}
                className="rounded-lg shadow-xl shadow-orange-500/50"
              />
            </div>
          </div>
          <div className="max-h-[calc(100vh-156px)] flex flex-col p-3 m-2 w-full">
            <div className="flex justify-end space-x-3 p-2">
              {isBookAccessible ? (
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${bookData.contentHash}`}
                  target="_blank"
                  className="flex items-center border-2 border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500 rounded-lg py-4 px-2 hover:scale-105"
                >
                  Read Book
                </a>
              ) : (
                <>
                  <button
                    className="flex flex-col items-center border-2 border-lime-700 text-lime-700 hover:text-white hover:bg-lime-500 rounded-lg p-2 hover:scale-105 "
                    onClick={() => purchase?.()}
                  >
                    <span className="font-semibold">Buy Access</span>
                    <span className="font-light text-sm">
                      @ ${bookData.purchasePrice || 0}
                    </span>
                  </button>

                  <button className="flex flex-col items-center border-2 border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500 rounded-lg p-2 hover:scale-105">
                    <span className="font-semibold">Rent Access</span>
                    <span className="font-light text-sm">
                      @ ${bookData.rentPrice || 0}
                    </span>
                  </button>
                </>
              )}
            </div>
            <div className="overflow-y-scroll ">
              <h5 className="text-lg capitalize font-semibold text-left text-gray-700">
                About the book:
              </h5>
              <p>{bookData.description}</p>
            </div>
          </div>
        </div>
        <div>
          <h5 className="text-lg capitalize font-semibold text-left text-gray-700">
            About the author:
          </h5>
          <p>{bookData.author}</p>
        </div>
      </main>
    </>
  );
}
