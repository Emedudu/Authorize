import { useBookData } from "@/lib/hooks";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { BiLoaderCircle } from "react-icons/bi";

export default function UploadSteps({
  mintIsLoading,
  uploadIsLoading,
  deployIsLoading,
  submitRef,
  mint,
  setShowModal,
}) {
  const router = useRouter();
  const { id } = router.query;
  const bookData = useBookData(id);
  const { isConnected } = useAccount();

  return (
    <section className="h-full bg-white p-4 rounded-2xl border-4 border-gray-300 w-1/5">
      <ol class="relative border-l border-gray-200 ">
        <li class="flex flex-row items-center mb-10 ml-4 ">
          <div
            class={`absolute w-4 h-4 rounded-full mt-2 -left-2 border border-white ${
              isConnected ? "bg-[green]" : "bg-gray-200"
            }`}
          ></div>

          <p
            class={`text-sm font-normal leading-none -mb-2 px-3 py-1 rounded ${
              isConnected ? "text-black" : "text-gray-400"
            }`}
          >
            Connect wallet
          </p>
        </li>

        <li class="flex flex-row items-center mb-10 ml-4 ">
          {deployIsLoading ? (
            <BiLoaderCircle
              className="animate-spin absolute mt-2 -left-2"
              color="orange"
              size={16}
            />
          ) : (
            <div
              class={`absolute w-4 h-4 rounded-full mt-2 -left-2 border border-white ${
                isConnected && id != "new" ? "bg-[green]" : "bg-gray-200"
              }`}
            ></div>
          )}
          <button
            class={`text-sm text-left font-normal leading-none text-gray-400 -mb-2 px-3 py-1 rounded hover:bg-orange-100 ${
              isConnected && id != "new" ? "text-black" : "text-gray-400"
            }`}
            onClick={() => submitRef.current.click()}
            disabled={id != "new"}
          >
            Deploy book to lighthouse
          </button>
        </li>

        <li class="flex flex-row items-center mb-10 ml-4 ">
          {mintIsLoading ? (
            <BiLoaderCircle
              className="animate-spin absolute mt-2 -left-2"
              color="orange"
              size={16}
            />
          ) : (
            <div
              class={`absolute w-4 h-4 rounded-full mt-2 -left-2 border border-white ${
                !isNaN(parseInt(id)) ? "bg-[green]" : "bg-gray-200"
              }`}
            ></div>
          )}
          <button
            class={`text-sm text-left font-normal leading-none -mb-2 px-3 py-1 rounded hover:bg-orange-100 ${
              !isNaN(parseInt(id)) ? "text-black" : "text-gray-400"
            }`}
            onClick={() => mint?.()}
            disabled={id == "new" || !isNaN(parseInt(id))}
          >
            Mint book on chain
          </button>
        </li>

        <li class="flex flex-row items-center mb-4 ml-4 ">
          {uploadIsLoading ? (
            <BiLoaderCircle
              className="animate-spin absolute mt-2 -left-2"
              color="orange"
              size={16}
            />
          ) : (
            <div
              class={`absolute w-4 h-4 rounded-full mt-2 -left-2 border border-white ${
                bookData.purchasePrice ? "bg-[green]" : "bg-gray-200"
              }`}
            ></div>
          )}
          <button
            class={`text-sm text-left font-normal leading-none -mb-2 px-3 py-1 rounded hover:bg-orange-100 ${
              bookData.purchasePrice ? "text-black" : "text-gray-400"
            }`}
            onClick={() => setShowModal(true)}
            disabled={isNaN(parseInt(id))}
          >
            Upload book to AUTHORize store
          </button>
        </li>
      </ol>
    </section>
  );
}
