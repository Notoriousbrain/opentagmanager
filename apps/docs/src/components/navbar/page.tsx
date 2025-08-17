import { Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import GlassSurface from "../ui/glass-surface";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();
  return (
    <header className="fixed w-full z-10 p-6 md:p-8 justify-center flex">
      <GlassSurface
        width={1000}
        height={60}
        borderRadius={0}
        className="w-full max-w-4xl md:w-3/5 flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4"
      >
        <div className="flex items-center justify-between w-full">
          <div onClick={() => router.push('/')} className="text-xl cursor-pointer font-semibold">OpenTagManager</div>
          <div className="flex items-center gap-4">
            <Link
              href="/roadmap"
              className="hover:text-gray-300 font-semibold transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="https://github.com/Notoriousbrain/OpenTagManager"
              className="hover:text-gray-300 transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </GlassSurface>
    </header>
  );
};

export default Navbar;
