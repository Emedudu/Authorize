import { applyAccessConditions, getMetadataFromHash } from "@/lib/helpers";
import { useBookData } from "@/lib/hooks";
import { Fragment } from "react";
import { Button, Modal } from "flowbite-react";
import bookABI from "@/abi/Book.json";
import { BiLoaderCircle } from "react-icons/bi";

const { useRouter } = require("next/router");

export default function UploadBookModal({
  setPurchasePrice,
  setRentPrice,
  upload,
  showModal,
  setShowModal,
  uploadIsLoading,
}) {
  const router = useRouter();
  const { id } = router.query;

  const bookData = useBookData(id);

  const uploadToBookshop = async () => {
    // console.log(bookData);
    const { contentHash } = await getMetadataFromHash(bookData.metadata);
    console.log(contentHash, bookABI.address, parseInt(id));
    await applyAccessConditions(contentHash, bookABI.address, parseInt(id));
    upload?.();
  };

  return (
    <Fragment>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Upload Book to Bookshop</Modal.Header>
        <Modal.Body className="flex flex-col space-y-5">
          <div>
            <p className="text-base font-normal">Purchase price*</p>
            <p className="text-sm font-light text-gray-500">
              Select an amount of FIL tokens that must be paid to access the
              book permanently
            </p>
            <input
              placeholder="Enter purchase price"
              type="number"
              className="w-full rounded-xl border-2 border-gray-400 p-3 mt-2"
              onChange={(e) => setPurchasePrice(e.target.value || "0")}
            />
          </div>

          <div>
            <p className="text-base font-normal">Rent price*</p>
            <p className="text-sm font-light text-gray-500">
              Select an amount of FIL tokens that must be paid to have access to
              a book for a day
            </p>
            <input
              placeholder="Enter rent price"
              type="number"
              className="w-full rounded-xl border-2 border-gray-400 p-3 mt-2"
              onChange={(e) => setRentPrice(e.target.value || "0")}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end">
          <Button
            color="gray"
            onClick={uploadToBookshop}
            disabled={uploadIsLoading}
          >
            {uploadIsLoading ? (
              <BiLoaderCircle
                className="animate-spin"
                color="white"
                size={20}
              />
            ) : (
              "Upload"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}
