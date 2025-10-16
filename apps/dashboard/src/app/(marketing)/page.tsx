"use client";
import { Button, Input } from "@otm/ui";
import React from "react";
import Image from "next/image";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";

const MarketingPage = () => {
  return (
    <main className="min-h-screen">
      <div className="absolute top-0 right-0 left-0 bottom-0 w-full pointer-events-none -z-10">
        <div>
          <Image
            alt="Background"
            src="/hero-bg.svg"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="z-10">
        <nav className="p-6 md:p-8 fixed w-full flex justify-between items-center h-[10dvh]">
          <div className="">
            <Image
              alt="OSS Tag"
              src="/logo.svg"
              width={100}
              height={100}
              className=""
            />
          </div>
          <div className="flex items-center gap-4">
            <GithubLogoIcon size={28} className="cursor-pointer" />
            <XLogoIcon size={28} className="cursor-pointer" />
            <Button className="font-bold cursor-pointer border border-gray-500 py-1 px-4 rounded-lg">
              Roadmap
            </Button>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-8 flex flex-col items-center">
              <p className="text-6xl font-bold">Get the insights you need without compromises.</p>
              <p className="text-sm md:text-xl text-gray-300 font-light max-w-lg mx-auto leading-relaxed">
                A privacy safe, open source replacement for legacy tag managers
                with simple analytics that actually matter.
              </p>
            </div>

            <div className="w-full max-w-md mx-auto">
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Let us know if youre interested"
                  className="flex-1 bg-transparent border-gray-500 rounded-lg text-sm h-12 px-6"
                />
                <Button
                  type="submit"
                  className="px-6 text-sm font-light cursor-pointer border border-gray-500 rounded-lg h-12 hover:bg-white hover:text-black"
                >
                Join Waitlist
                </Button>
              </form>
              <div className="text-xs  text-gray-500 mt-3">
                {/* <div className="bg-[#05FF02] size-3 rounded-full"></div> */}
                100 people are already interested.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MarketingPage;
