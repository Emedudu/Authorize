import { deployContentToIpfs, deployImageToIpfs } from "@/lib/helpers";
import React from "react";

function FileInput({ fileData, setFileData, id, disabled }) {
  return (
    <div className="flex flex-col items-center justify-center ">
      <div
        className="w-full"
        style={{
          backgroundImage: `url(https://gateway.lighthouse.storage/ipfs/${
            id == "image" && fileData?.Hash
          })`,
        }}
      >
        <label
          for={id}
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-90"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              class="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span class="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {id == "image" ? "SVG, PNG, JPG or GIF (MAX. 800x400px)" : ".PDF"}
            </p>
          </div>
          <input
            id={id}
            type="file"
            class="hidden"
            disabled={disabled}
            onChange={(e) =>
              id == "image"
                ? deployImageToIpfs(e).then((res) => setFileData(res))
                : deployContentToIpfs(e).then((res) => setFileData(res))
            }
          />
        </label>
      </div>
      <p>{fileData?.Name}</p>
    </div>
  );
}

export default FileInput;
