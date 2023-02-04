import Link from "next/link";
import React, { useContext } from "react";
import { VscSignOut } from "react-icons/vsc";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { auth } from "@/lib/firebase";
import { UserContext } from "@/lib/context";
import { useAccount } from "wagmi";
import { shortenAddress } from "@/lib/helpers";

function Navbar(props) {
  const signOut = async () => {};

  const { username, userETH, userAvatar } = useContext(UserContext);

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
        <Web3Button />

        {username ? (
          <div className="relative flex items-center md:order-2 group">
            <button className=" flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 ">
              <img
                className="w-8 h-8 rounded-full"
                src={`https://avatars.dicebear.com/api/avataaars/${userAvatar}.svg`}
                alt="user photo"
              />
            </button>

            <div className="z-10 hidden group-hover:flex flex-col absolute right-0 top-4 my-4 text-base bg-white divide-y divide-gray-100 rounded-lg shadow">
              <div className="flex justify-center p-2">
                <img
                  className="w-24 h-24 rounded-full"
                  src={`https://avatars.dicebear.com/api/avataaars/${userAvatar}.svg`}
                  alt="user photo"
                />
              </div>
              <Link
                className="px-4 py-2 overflow-x-hidden capitalize hover:bg-gray-50"
                href={"/users/me"}
              >
                {username}
              </Link>
              <div className="px-4 py-2 overflow-x-hidden hover:underline">
                <a
                  href={`https://explorer.glif.io/address/${userETH}/?network=hyperspace`}
                >
                  {shortenAddress(userETH)}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <Link
            className="flex items-center focus:outline-none hover:text-white text-red-700 bg-transparent border-2 border-red-700 hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-xl px-3 py-1.5"
            href={"/signIn"}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
