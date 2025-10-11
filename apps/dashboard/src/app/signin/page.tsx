import SignInComponent from "@/components/auth/sign-in";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <main className="min-h-dvh lg:mr-[48%] flex items-center justify-center p-6">
        <SignInComponent />
      </main>

      <aside className="hidden lg:block fixed inset-y-0 right-0 w-[48%] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/signin-image.jpg"
            alt="Privacy-first analytics in action"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 48vw, 0px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-8">
          <header className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-white/20 bg-black/40 backdrop-blur">
              <span className="text-[10px] font-semibold tracking-widest text-white">
                OTM
              </span>
            </div>
            <div className="h-5 w-px bg-white/30" aria-hidden="true" />
            <span className="text-white/80">Open Tag Manager</span>
          </header>

          <footer className="text-white/60 text-sm">
            © {new Date().getFullYear()} OTM. All rights reserved.
          </footer>
        </div>
      </aside>
    </div>
  );
}
