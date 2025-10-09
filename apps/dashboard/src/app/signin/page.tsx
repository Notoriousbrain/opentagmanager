import SignInComponent from "@/components/auth/sign-in";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="h-dvh flex overflow-hidden">
      <div className="flex-1">
        <SignInComponent />
      </div>
      <div className="flex-0 lg:flex-1">
        <Image src="/signin-image.jpg" alt="img" width={2000} height={2000} />
      </div>
    </main>
  );
}
