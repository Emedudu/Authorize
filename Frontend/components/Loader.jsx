import React from "react";
import { BiLoaderCircle } from "react-icons/bi";

function Loader(props) {
  return (
    <main className="h-screen w-screen bg-gray-50 absolute top-0 left-0 flex items-center justify-center opacity-75">
      <BiLoaderCircle
        className="animate-spin text-3xl"
        color="orange"
        size={100}
      />
    </main>
  );
}

export default Loader;
