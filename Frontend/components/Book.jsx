import Image from "next/image";
import Link from "next/link";
import React from "react";

function Book({ details }) {
  return (
    <div className="inline-flex flex-col items-center rounded-lg space-y-2 hover:border p-2 border-orange-200">
      <Link
        className="relative h-60 w-40 hover:scale-105"
        href={`/books/${details.id}`}
      >
        <Image
          src={`https://gateway.lighthouse.storage/ipfs/${details.imageHash}`}
          fill={true}
        />
      </Link>

      <div class="text-sm text-gray-700">
        <Link
          href={`/books/${details.id}`}
          className="hover:underline hover:text-orange-700"
        >
          {details.name}
        </Link>
        {/* <p>Rating:</p> */}
        <p>
          Price:{" "}
          <span className="hover:underline hover:text-orange-700">
            $ {details.purchasePrice || 0}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Book;
