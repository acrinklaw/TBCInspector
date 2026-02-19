import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <div className="flex flex-col items-center gap-10 w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-cinzel text-4xl font-bold tracking-wide text-amber-100 mb-2">
            TBC Gear Inspector
          </h1>
          <p className="text-neutral-500 text-sm tracking-wide">
            Sign in to continue
          </p>
        </div>
        <div className="wow-panel p-6 w-full">
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
