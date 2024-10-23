"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmail } from "@/services";
import { UserCredential } from "firebase/auth";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>("");

  /**
   * Handle Submit
   * @param event 
   * @returns 
   */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const status = await signInWithEmail({ email, password });
      if ('success' in status && !status.success) {
        setError(status.message);
        return;
      }

      const userCredential = status as UserCredential;

      const idToken = await userCredential.user.getIdToken();

      const response = await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        console.error("Login Response Failed: ", response)
      }


      router.push("/");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="flex min-h-[100vh] flex-col items-center justify-center px-4">

      <div className="w-[85vw] sm:w-[80vw] md:w-[40vw] h-auto">
        <Image src="/geotech-info-services.png" alt="Geotech Logo"
          layout="responsive" priority
          width={1716} height={318} />
      </div>

      <form onSubmit={handleSubmit} action="#"
        className="flex flex-col shadow p-8 rounded w-[100%] sm:w-[80%] md:w-[40%] bg-hsl-l100 dark:bg-hsl-l13 mt-16">
        <h1 className="text-center text-xl mb-4">Login</h1>

        {error && (
          <div role="alert" className="bg-rose-300 border border-rose-400 rounded-sm py-1 my-4">
            <p className="text-sm text-center text-rose-600 dark:text-rose-600">{error}</p>
          </div>
        )}

        <input type="email" name="email" id="email" placeholder="Email" required
          className="df-input w-full rounded-lg py-4"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <input type="password" name="password" id="password" placeholder="Password" required
          className="df-input w-full rounded-lg py-4 mt-3"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className="btn cta-btn mt-3 w-full">Login</button>

        <p className="text-sub-14 text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-hsl-l5 dark:text-hsl-l85 hover:underline">Register</Link>
        </p>

      </form>
    </main>
  );
}