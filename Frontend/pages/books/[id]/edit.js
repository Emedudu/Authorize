import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useBookData } from "@/lib/hooks";
import FileInput from "@/components/FileInput";
import TextArea from "@/components/TextArea";
import { useForm } from "react-hook-form";
import {
  applyAccessConditions,
  deployMetadataToIpfs,
  getMetadataFromHash,
} from "@/lib/helpers";
import { BiLoaderCircle } from "react-icons/bi";
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
import { ethers } from "ethers";
import UploadSteps from "@/components/UploadSteps";
import UploadBookModal from "@/components/UploadBookModal";
import { toast } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  // bookData returns data from firebase
  // metadata has to be fetched and parsed first
  const bookData = useBookData(id);

  const { username } = useContext(UserContext);

  const submitRef = useRef(null);

  const [imageData, setImageData] = useState({ Hash: "" });
  const [contentData, setContentData] = useState({ Hash: "" });
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");

  const [deployIsLoading, setDeployIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("0");
  const [rentPrice, setRentPrice] = useState("0");

  useEffect(() => {
    setImageData({ ...imageData, Hash: bookData.imageHash });
    setContentData({ ...contentData, Hash: bookData.contentHash });
    setBookTitle(bookData.name);
    setBookDescription(bookData.description);
  }, [
    bookData.imageHash,
    bookData.contentHash,
    bookData.name,
    bookData.description,
  ]);

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
      if (!error) {
        toast.success("Minted book successfully");
        const bookId = parseInt(data.logs[0].topics[3]);
        setTimeout(() => {
          router.push(`/books/${bookId}/edit`);
        }, 3000);
      }
    },
  });

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
      if (!error) {
        toast.success(`Minted book ${id} successfully`);
        setShowModal(false);
        setTimeout(() => {
          router.push(`/books/${id}`);
        }, 3000);
      }
    },
  });

  const callDeployMetadata = async (val) => {
    // const { name, description } = val;
    if (!(imageData.Hash && contentData.Hash && bookTitle && bookDescription)) {
      toast.error("All fields are required");
      return;
    }

    setDeployIsLoading(true);
    try {
      const res = await deployMetadataToIpfs({
        name: bookTitle,
        description: bookDescription,
        imageData: JSON.stringify(imageData),
        contentData: JSON.stringify(contentData),
      });

      const docRef = doc(db, "books", res.Hash);
      await setDoc(docRef, {
        name: bookTitle,
        metadata: res.Hash,
        genre: "",
        author: username,
        buyingPrice: 0,
        sellingPrice: 0,
        tag: "",
      });

      toast.success("Deployed book successfully");

      setTimeout(() => {
        router.push(`/books/${res.Hash}/edit`);
      }, 3000);

      // set access conditions on lighthouse for the contentData once the book has been created onChain and the bookId retrieved
    } catch (error) {
      toast.error("Oops! Could not deploy to lighthouse");
    }
    setDeployIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>AUTHORize</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-row justify-between p-10">
        <UploadSteps
          mintIsLoading={mintIsLoading}
          uploadIsLoading={uploadIsLoading}
          deployIsLoading={deployIsLoading}
          submitRef={submitRef}
          mint={mint}
          setShowModal={setShowModal}
        />
        <section className="bg-white flex flex-col items-center rounded-2xl border-4 border-gray-300 py-3 px-8 space-y-5 w-2/4">
          <div className="w-full ">
            <p className="text-base font-normal">Cover image*</p>
            <p className="text-sm font-light text-gray-500">
              Select a cover image in png, jpg, or svg format
            </p>
            <div className="w-full mt-3">
              <FileInput
                fileData={imageData}
                setFileData={setImageData}
                id={"image"}
                key={1}
                disabled={id != "new"}
              />
            </div>
          </div>

          <div className="w-full">
            <p className="text-base font-normal">Book Content*</p>
            <p className="text-sm font-light text-gray-500">
              Upload a book in pdf format
            </p>
            <div className="w-full mt-3">
              <FileInput
                fileData={contentData}
                setFileData={setContentData}
                id={"content"}
                key={2}
                disabled={id != "new"}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(callDeployMetadata)} className="w-full">
            <div className="w-full mb-4">
              <p className="text-base font-normal">Title*</p>
              <p className="text-sm font-light text-gray-500">
                Pick a suitable and catchy title.
              </p>
              <input
                type="text"
                id="first_name"
                class="bg-gray-100 border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 mt-3"
                placeholder="The Pregnant Ghost"
                required
                value={bookTitle}
                disabled={id != "new"}
                onChange={(e) => setBookTitle(e.target.value)}
                // {...register("name")}
              />
            </div>

            <div className="w-full">
              <p className="text-base font-normal">Description*</p>
              <p className="text-sm font-light text-gray-500">
                Describe your book
              </p>
              <textarea
                id="editor"
                rows="8"
                class="bg-gray-100 border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 mt-3"
                placeholder="Write a description"
                required
                value={bookDescription}
                disabled={id != "new"}
                onChange={(e) => setBookDescription(e.target.value)}
                // {...register("description")}
              />
            </div>
            <button type="submit" ref={submitRef}></button>
          </form>
          {!isConnected ? (
            <Web3Button />
          ) : (
            <button
              className="bg-orange-400 px-3 py-2 hover:scale-105 rounded-lg border-2 border-gray-100 text-gray-100 font-semibold"
              onClick={(e) => {
                id == "new"
                  ? submitRef.current.click()
                  : isNaN(parseInt(id))
                  ? mint?.()
                  : setShowModal(true);
              }}
              disabled={mintIsLoading || uploadIsLoading}
            >
              {mintIsLoading || uploadIsLoading || deployIsLoading ? (
                <BiLoaderCircle
                  className="animate-spin"
                  color="white"
                  size={20}
                />
              ) : id == "new" ? (
                "Deploy"
              ) : isNaN(parseInt(id)) ? (
                "Mint"
              ) : (
                "Upload"
              )}
            </button>
          )}
        </section>

        <section className="h-full bg-white rounded-2xl border-4 border-gray-300 p-3 space-y-3 w-1/4">
          <div className="capitalize font-semibold text-lg underline">
            Sample Book
          </div>
          <div>
            <p className="text-base font-normal mb-2 underline">Cover Image</p>
            <img
              src="https://cdn-images-1.medium.com/max/326/0*SEuJIsmCSnwv9cKD"
              className="h-64 w-64 object-contain"
            />
          </div>

          <div>
            <p className="text-base font-normal mb-2 underline">Book Content</p>
            <p className="mx-auto text-xl font-semibold">
              Long Walk to Water.pdf
            </p>
          </div>

          <div>
            <p className="text-base font-normal mb-2 underline">Book Title</p>
            <p className="mx-auto ">A Long Walk to Water</p>
          </div>

          <div>
            <p className="text-base font-normal mb-2 underline">
              Book Description
            </p>
            <p className="mx-auto ">
              A Long Walk to Water is a comedy drama, where two young
              adventurers left their home in Argentina to River Nile in search
              of the hidden gemstone which enhances their soccer playing skills.
              The journey wasn't as easy as they had anticipated.
            </p>
          </div>
        </section>

        <UploadBookModal
          upload={upload}
          uploadIsLoading={uploadIsLoading}
          setPurchasePrice={setPurchasePrice}
          setRentPrice={setRentPrice}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </main>
    </>
  );
}
