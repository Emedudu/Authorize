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
import { useContext, useEffect, useState } from "react";
import { useBookData } from "@/lib/hooks";
import Image from "next/image";
import bookABI from "@/abi/Book.json";
import { ethers } from "ethers";
import { Fragment } from "react";
import { Button, Modal } from "flowbite-react";
import { BiLoaderCircle } from "react-icons/bi";
import { CiEdit } from "react-icons/ci";
import { UserContext } from "@/lib/context";
import Link from "next/link";
import { toast } from "react-hot-toast";
// import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  const { address } = useAccount();

  const bookData = useBookData(id);
  const { username } = useContext(UserContext);
  // username==bookData.author;.

  const [showModal, setShowModal] = useState(false);

  const { isConnected } = useAccount();

  const { config: configToPurchase } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "buyAccess",
    args: [parseInt(id)],
    overrides: {
      value: ethers.utils.parseEther(
        bookData?.purchasePrice?.toString() || "0"
      ),
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
      if (!error) {
        toast.success(`You now have access to book ${id}`);
        setTimeout(() => {
          router.push(`/books/${id}`);
        }, 3000);
      }
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
      <main className="relative flex flex-col space-y-5 p-4">
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
                  href={`https://files.lighthouse.storage/viewFile/${bookData.contentHash}`}
                  target="_blank"
                  className="flex items-center border-2 border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500 rounded-lg py-4 px-2 hover:scale-105"
                >
                  Read Book
                </a>
              ) : (
                <>
                  <button
                    className="flex flex-col items-center border-2 border-lime-700 text-lime-700 hover:text-white hover:bg-lime-500 rounded-lg p-2 hover:scale-105 "
                    onClick={() => {
                      if (!isConnected) {
                        toast.error("Connect your wallet");
                        return;
                      }
                      purchase?.();
                    }}
                  >
                    <span className="font-semibold">Buy Access</span>
                    <span className="font-light text-sm">
                      @ ${bookData.purchasePrice || 0}
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center border-2 border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500 rounded-lg p-2 hover:scale-105"
                    onClick={() => setShowModal(true)}
                  >
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
        <RentBookModal showModal={showModal} setShowModal={setShowModal} />
        {username == bookData.author && (
          <Link
            className="absolute top-1.5 right-1.5 p-2 rounded-full hover:bg-gray-200"
            href={`/books/${id}/edit`}
          >
            <CiEdit size={30} className="text-black hover:text-orange-700" />
          </Link>
        )}
      </main>
    </>
  );
}

function RentBookModal({ showModal, setShowModal }) {
  const router = useRouter();
  const { id } = router.query;

  const bookData = useBookData(id);

  const [rentAmount, setRentAmount] = useState(bookData.rentPrice || "0");

  const { isConnected } = useAccount();

  const { config: configToRent } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "rentAccess",
    args: [parseInt(id)],
    overrides: {
      value: ethers.utils.parseEther(rentAmount || "0"),
    },
    onSettled: (data, error) => {
      console.log({ data, error });
    },
  });

  const {
    data: rentData,
    isLoading: rentIsLoading,
    error: rentError,
    isError: rentIsError,
    isSuccess: rentIsSuccess,
    write: rent,
  } = useContractWrite(configToRent);

  useWaitForTransaction({
    hash: rentData?.hash,
    onSettled(data, error) {
      if (!error) {
        toast.success(`You have access to book ${id} till...`);
        setShowModal(false);
        setTimeout(() => {
          router.push(`/books/${id}`);
        }, 3000);
      }
    },
  });

  return (
    <Fragment>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Rent Book</Modal.Header>
        <Modal.Body className="flex flex-col space-y-5">
          <div>
            <p className="text-base font-normal">Amount of FIL*</p>
            <p className="text-sm font-light text-gray-500">
              Select an amount of FIL tokens that you want to pay to rent this
              book. It must be greater or equal to the set Rent price
            </p>
            <input
              placeholder="Enter amount"
              type="number"
              className="w-full rounded-xl border-2 border-gray-400 p-3 mt-2"
              onChange={(e) => setRentAmount(e.target.value || "0")}
              value={rentAmount}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end">
          <Button
            color="gray"
            onClick={() => {
              if (!isConnected) {
                toast.error("Connect your wallet");
                return;
              }
              rent?.();
            }}
            disabled={rentIsLoading}
          >
            {rentIsLoading ? (
              <BiLoaderCircle
                className="animate-spin"
                color="white"
                size={20}
              />
            ) : (
              "Rent"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}
