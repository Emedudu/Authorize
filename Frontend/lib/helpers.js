import lighthouse from "@lighthouse-web3/sdk";

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

export const deployImageToIpfs = async (e) => {
  const output = await lighthouse.upload(
    e,
    process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY,
    progressCallback
  );
  console.log("File Status:", output);
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
