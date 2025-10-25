import { Button } from "@otm/ui";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const NavbarLanding = () => {
  return (
    <nav className="p-6 md:p-8 fixed w-full flex justify-between items-center h-[10dvh]">
      <Link href="/" className="">
        <Image
          alt="OSS Tag"
          src="/logo.svg"
          width={100}
          height={100}
          className=""
        />
      </Link>
      <Link href="/roadmap">
        <Button className="font-bold cursor-pointer border border-gray-500 py-2 px-4 rounded-sm">
          Roadmap
        </Button>
      </Link>
    </nav>
  );
};

export default NavbarLanding;
