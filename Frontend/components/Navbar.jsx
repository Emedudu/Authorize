import Link from "next/link";
import React from "react";
import { VscSignOut } from "react-icons/vsc";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { auth } from "@/lib/firebase";

function Navbar(props) {
  const signOut = async () => {
    await auth.signOut();
    router.push("/");
    return;
  };
  return (
    <nav className="flex px-8 py-8 text-lg font-semibold text-gray-600 shadow-sm justify-between items-center">
      <Link
        href={"/"}
        className="logo animate-pulse hover:animate-bounce font-bold text-2xl"
      >
        AUTHORize
      </Link>
      <div className="flex space-x-10">
        <Link
          href={"/bookshop"}
          className="hover:scale-110 hover:underline decoration-inherit decoration-2 underline-offset-4 hover:uppercase"
        >
          Bookshop
        </Link>
        <Link
          href={"/users/me"}
          className="hover:scale-110 hover:underline decoration-inherit decoration-2 underline-offset-4 hover:uppercase"
        >
          Dashboard
        </Link>
        <Link
          href={"/books/new/edit"}
          className="hover:scale-110 hover:underline decoration-inherit decoration-2 underline-offset-4 hover:uppercase"
        >
          Create
        </Link>
        <Link
          href={"/"}
          className="hover:scale-110 hover:underline decoration-inherit decoration-2 underline-offset-4 hover:uppercase"
        >
          P2P
        </Link>
      </div>

      <div className="flex items-center space-x-10">
        <div>Profile</div>
        <button
          type="button"
          class="flex items-center focus:outline-none hover:text-white text-red-700 bg-transparent border-2 border-red-700 hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-xl px-3 py-1.5"
          onClick={signOut}
        >
          Exit <VscSignOut className="ml-2" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
