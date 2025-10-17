"use client";
import React from "react";
import Image from "next/image";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import WaitlistForm from "@/components/landing/waitlist-form";
import NavbarLanding from "@/components/landing/navbar";
import Link from "next/link";

const MarketingPage = () => {
  return (
    <main className="min-h-screen">
      <div className="absolute top-0 right-0 left-0 bottom-0 w-full pointer-events-none -z-10">
        <Image
          alt="Background"
          src="/hero-bg.svg"
          fill
          className="object-cover"
        />
      </div>
      <div className="z-10">
        <NavbarLanding />
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-8 flex flex-col items-center">
              <p className="text-3xl md:text-6xl font-bold">
                Get the insights you need without compromises.
              </p>
              <p className="text-sm md:text-xl text-gray-300 font-light max-w-lg mx-auto leading-relaxed">
                A privacy safe, open source replacement for legacy tag managers
                with simple analytics that actually matter.
              </p>
            </div>

            <WaitlistForm />
          </div>
        </div>
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-8">
          <Link href="https://github.com/opentagmanager/osstag" target="_blank" rel="noopener noreferrer">
            <GithubLogoIcon size={28} className="cursor-pointer" />
          </Link>
          <Link
            href="https://x.com/osstagdotcom"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XLogoIcon size={28} className="cursor-pointer" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default MarketingPage;
