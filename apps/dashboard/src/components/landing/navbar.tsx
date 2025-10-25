import { Button } from "@otm/ui";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BiStar } from "react-icons/bi";

const NavbarLanding = () => {
  return (
    <nav className="p-6 md:p-8 fixed w-full flex justify-between bg-black items-center h-[10dvh]">
      <Link href="/" className="">
        <Image
          alt="OSS Tag"
          src="/logo.svg"
          width={100}
          height={100}
          className=""
        />
      </Link>
      <div className="flex items-center gap-4">
        <Link href="https://github.com/opentagmanager/osstag">
          <Button className="font-bold cursor-pointer border border-gray-500 py-2 px-4 rounded-sm">
           <BiStar size={16}/> Star
          </Button>
        </Link>
        <Link href="/roadmap">
          <Button className="font-bold cursor-pointer border border-gray-500 py-2 px-4 rounded-sm">
            Roadmap
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarLanding;
