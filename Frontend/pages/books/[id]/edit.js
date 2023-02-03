import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useBookData } from "@/lib/hooks";
import FileInput from "@/components/FileInput";
import TextArea from "@/components/TextArea";
import { FaHandPointRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  applyAccessConditions,
  deployMetadataToIpfs,
  getMetadataFromHash,
} from "@/lib/helpers";
import { VscDebugContinueSmall } from "react-icons/vsc";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import bookABI from "@/abi/Book.json";
import { Web3Button } from "@web3modal/react";
import { LoaderContext, UserContext } from "@/lib/context";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button, Modal } from "flowbite-react";
import { ethers } from "ethers";

function UploadBookModal() {
  const router = useRouter();
  const { id } = router.query;

  const bookData = useBookData(id);

  const { isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const [purchasePrice, setPurchasePrice] = useState("0");
  const [rentPrice, setRentPrice] = useState("0");

  const { config: configToUpload } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "uploadBook",
    args: [
      parseInt(id),
      ethers.utils.parseEther(purchasePrice),
      ethers.utils.parseEther(rentPrice),
    ],

    onSettled: (data, error) => {
      console.log({ data, error });
    },
  });

  const {
    data: uploadData,
    isLoading: uploadIsLoading,
    error: uploadError,
    isError: uploadIsError,
    isSuccess: uploadIsSuccess,
    write: upload,
  } = useContractWrite(configToUpload);

  useWaitForTransaction({
    hash: uploadData?.hash,
    onSettled(data, error) {
      setShowModal(false);
    },
  });

  const uploadToBookshop = async () => {
    // console.log(bookData);
    const { contentHash } = await getMetadataFromHash(bookData.metadata);
    console.log(contentHash, bookABI.address, parseInt(id));
    await applyAccessConditions(contentHash, bookABI.address, parseInt(id));
    upload?.();
  };

  return (
    <Fragment>
      <button
        className="flex items-center justify-center h-full lg:w-1/4 bg-gradient-to-br from-[#fceabb] to-[#f8b500] hover:bg-gradient-to-bl p-5"
        onClick={() => isConnected && setShowModal(true)}
      >
        {isConnected ? (
          <p className="flex items-center">
            Upload Book to AUTHORize store{" "}
            <VscDebugContinueSmall className="ml-2" />
          </p>
        ) : (
          <Web3Button />
        )}
      </button>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Upload Book to Bookshop</Modal.Header>
        <Modal.Body className="flex flex-col">
          <input
            placeholder="enter a purchase price"
            type="number"
            className="w-full"
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
          <input
            placeholder="enter a rent price"
            type="number"
            className="w-full"
            onChange={(e) => setRentPrice(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={uploadToBookshop}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}
export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  // bookData returns data from firebase
  // metadata has to be fetched and parsed first
  const bookData = useBookData(id);

  const { setLoading } = useContext(LoaderContext);
  const { username } = useContext(UserContext);

  const submitRef = useRef(null);

  const [imageData, setImageData] = useState(bookData.imageData);
  const [contentData, setContentData] = useState(bookData.fileData);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { address, isConnected } = useAccount();

  const { config: configToMint } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "createBook",
    args: [id],
  });

  const {
    data: mintData,
    isLoading: mintIsLoading,
    error: mintError,
    isError: mintIsError,
    isSuccess: mintIsSuccess,
    write: mint,
  } = useContractWrite(configToMint);

  useWaitForTransaction({
    hash: mintData?.hash,
    onSettled(data, error) {
      const bookId = parseInt(data.logs[0].topics[3]);
      router.push(`/books/${bookId}/edit`);
    },
  });

  const callDeployMetadata = async (val) => {
    const { name, description } = val;

    try {
      const res = await deployMetadataToIpfs({
        name,
        description,
        imageData: JSON.stringify(imageData),
        contentData: JSON.stringify(contentData),
      });

      const docRef = doc(db, "books", res.Hash);
      await setDoc(docRef, {
        name,
        metadata: res.Hash,
        genre: "",
        author: username,
        buyingPrice: 0,
        sellingPrice: 0,
        tag: "",
      });

      router.push(`/books/${res.Hash}/edit`);
      // set access conditions on lighthouse for the contentData once the book has been created onChain and the bookId retrieved
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>AUTHORize</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-row justify-between h-[calc(100vh-108px)]">
        <section className="overflow-y-scroll h-full ml-10">
          <div className="flex flex-row items-center justify-between mb-4">
            <div className="w-full md:w-1/2">
              <p className="text-red-700 text-sm font-semibold">
                Pick a cover image for your book. This is crucial in identifying
                your book*
              </p>
              <FileInput
                fileData={imageData}
                setFileData={setImageData}
                id={"image"}
                key={1}
              />
            </div>
            <p className="self-center text-red-700 flex items-center">
              e.g. <FaHandPointRight className="ml-2 text-gray-100 text-xl" />
            </p>
            <div className="">
              <img
                src="https://cdn-images-1.medium.com/max/326/0*SEuJIsmCSnwv9cKD"
                className="h-64 w-64 object-contain"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="w-full md:w-1/2">
              <p className="text-red-700 text-sm font-semibold">
                Pick a book you have written*
              </p>
              <FileInput
                fileData={contentData}
                setFileData={setContentData}
                id={"content"}
                key={2}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(callDeployMetadata)}>
            <div className="w-full mb-4">
              <p className="text-red-700 text-sm font-semibold">
                Give the book a short and catchy title*
              </p>
              <input
                type="text"
                id="first_name"
                class="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                placeholder="The Pregnant Ghost"
                required
                {...register("name")}
              />
            </div>

            <div className="w-full">
              <p className="text-red-700 text-sm font-semibold">
                Describe the book to arouse your viewers interest*
              </p>
              <TextArea register={register} />
            </div>
            <button type="submit" ref={submitRef}></button>
          </form>
        </section>
        {id == "new" ? (
          <button
            className="flex items-center justify-center h-full lg:w-1/4 bg-gradient-to-br from-[#fceabb] to-[#f8b500] hover:bg-gradient-to-bl p-5"
            onClick={() => isConnected && submitRef.current.click()}
          >
            {isConnected ? (
              <p className="flex items-center">
                Deploy Book <VscDebugContinueSmall className="ml-2" />
              </p>
            ) : (
              <Web3Button />
            )}
          </button>
        ) : isNaN(id) ? (
          <button
            className="flex items-center justify-center h-full lg:w-1/4 bg-gradient-to-br from-[#fceabb] to-[#f8b500] hover:bg-gradient-to-bl p-5"
            onClick={() => isConnected && mint?.()}
          >
            {isConnected ? (
              <p className="flex items-center">
                Mint Book onChain <VscDebugContinueSmall className="ml-2" />
              </p>
            ) : (
              <Web3Button />
            )}
          </button>
        ) : (
          <UploadBookModal />

          // <button
          //   className="flex items-center justify-center h-full lg:w-1/4 bg-gradient-to-br from-[#fceabb] to-[#f8b500] hover:bg-gradient-to-bl p-5"
          //   onClick={() => isConnected && upload?.()}
          // >
          //   {isConnected ? (
          //     <p className="flex items-center">
          //       Upload Book to AUTHORize store{" "}
          //       <VscDebugContinueSmall className="ml-2" />
          //     </p>
          //   ) : (
          //     <Web3Button />
          //   )}
          // </button>
        )}
      </main>
    </>
  );
}
