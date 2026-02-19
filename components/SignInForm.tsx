"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-amber-200/70 uppercase tracking-wider"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoComplete="email"
          required
          className="bg-neutral-800/80 border border-amber-900/50 rounded-lg px-4 py-3 text-amber-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-amber-200/70 uppercase tracking-wider"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
          className="bg-neutral-800/80 border border-amber-900/50 rounded-lg px-4 py-3 text-amber-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:from-amber-800 disabled:to-amber-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-150 shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 active:scale-[0.98] cursor-pointer"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
