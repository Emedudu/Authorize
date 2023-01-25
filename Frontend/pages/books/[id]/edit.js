import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useBookData } from "@/lib/hooks";
import FileInput from "@/components/FileInput";
import TextArea from "@/components/TextArea";
import { FaHandPointRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { deployMetadataToIpfs } from "@/lib/helpers";
import { VscDebugContinueSmall } from "react-icons/vsc";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import bookABI from "@/abi/Book.json";
import { Web3Button } from "@web3modal/react";
import { LoaderContext } from "@/lib/context";
// import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  // bookData returns data from firebase
  // ipfsHash has to be fetched and parsed first
  const bookData = useBookData(id);

  const { setLoading } = useContext(LoaderContext);
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

  const { config } = usePrepareContractWrite({
    address: bookABI.address,
    abi: bookABI.abi,
    chainId: 3141,
    functionName: "createBook",
    args: [1],
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  });

  const { data, isLoading, error, isError, write } = useContractWrite(config);

  const callDeployMetadata = async (val) => {
    setLoading(true);
    const { name, description } = val;
    try {
      const res = await deployMetadataToIpfs({
        name,
        description,
        imageData: JSON.stringify(imageData),
        contentData: JSON.stringify(contentData),
      });
      write();
      console.log(res);
    } catch (error) {
      console.log("error");
    }
    setLoading(false);
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
        <section
          className="flex items-center justify-center h-full lg:w-1/4 bg-gradient-to-br from-[#fceabb] to-[#f8b500] hover:bg-gradient-to-bl cursor-pointer p-5"
          onClick={() => isConnected && submitRef.current.click()}
        >
          {isConnected ? (
            <p className="flex items-center">
              Continue <VscDebugContinueSmall className="ml-2" />
            </p>
          ) : (
            <Web3Button />
          )}
        </section>
      </main>
    </>
  );
}
