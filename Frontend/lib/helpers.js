import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";
import { ethers } from "ethers";

export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(blob);
    reader.onerror = () => {
      reject(new Error("文件流异常"));
    };
  });
};

const progressCallback = (progressData) => {
  let percentageDone =
    100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
  console.log(percentageDone);
};

const encryptionSignature = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const messageRequested = (await lighthouse.getAuthMessage(address)).data
    .message;
  const signedMessage = await signer.signMessage(messageRequested);
  return {
    signedMessage: signedMessage,
    publicKey: address,
  };
};

export const deployImageToIpfs = async (e) => {
  const output = await lighthouse.upload(
    e,
    process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY,
    progressCallback
  );
  console.log("File Status:", output);
  return output.data;
};

export const deployContentToIpfs = async (e) => {
  const sig = await encryptionSignature();
  const output = await lighthouse.uploadEncrypted(
    e,
    sig.publicKey,
    process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY,
    sig.signedMessage,
    progressCallback
  );
  console.log(output);
  return output.data;
};

export const deployMetadataToIpfs = async (obj) => {
  const output = await lighthouse.uploadText(
    JSON.stringify(obj),
    process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY,
    progressCallback
  );
  console.log("File Status:", output);
  return output.data;
};

export const getMetadataFromHash = async (hash) => {
  const { data } = await axios.get(`/api/ipfs/${hash}`);
  console.log(data);

  const { name, description, imageData, contentData } = data;
  return {
    name,
    description,
    imageHash: JSON.parse(imageData).Hash,
    contentHash: JSON.parse(contentData).Hash,
  };
};

export const applyAccessConditions = async (cid, contractAddress, bookId) => {
  const conditions = [
    {
      id: 1,
      chain: "hyperspace",
      method: "canAccessBook",
      standardContractType: "Custom",
      contractAddress: contractAddress,
      returnValueTest: {
        comparator: "==",
        value: "true",
      },
      parameters: [bookId, ":userAddress"],
      inputArrayType: ["uint256", "address"],
      outputType: "bool",
    },
  ];

  const aggregator = "([1])";
  const { publicKey, signedMessage } = await encryptionSignature();

  try {
    console.log(publicKey, cid, signedMessage, conditions, aggregator);
    const response = await lighthouse.accessCondition(
      publicKey,
      cid,
      signedMessage,
      conditions,
      aggregator
    );

    console.log("response:", response);
  } catch (error) {
    console.log("error:", error);
  }
};

export const shortenAddress = (address) => {
  return `${address.slice(0, 8)}...${address.slice(36)}`;
};
