"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/services";
import Image from "next/image";

export default function Register() {
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState("");
  const router = useRouter();

  /**
   * Handle Submit
   * @param event 
   * @returns 
   */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await registerWithEmail(userName, email, password);
      if (response) router.push("/login");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUserName('');
      setEmail('');
      setPassword('')
      setConfirmPassword('');
    }
  }

  return (
    <main className="flex min-h-[100vh] flex-col items-center justify-center px-4">

      <div className="w-[85vw] sm:w-[80vw] md:w-[40vw] h-auto">
        <Image src="/geotech-info-services.png" alt="Geotech Logo"
          layout="responsive"
          width={1716} height={318} />
      </div>

      <form onSubmit={handleSubmit} action="#"
        className="flex flex-col shadow p-8 rounded w-[100%] sm:w-[80%] md:w-[50%] mt-16 bg-hsl-l100 dark:bg-hsl-l13" >
        <h1 className="text-center text-xl">Register</h1>

        {error && (
          <div role="alert" className="bg-rose-300 border border-rose-400 rounded-sm py-1 my-4">
            <p className="text-sm text-center text-rose-600 dark:text-rose-600">{error}</p>
          </div>
        )}

        <input type="text" name="userName" className="df-input my-2" placeholder="Name" required
          value={userName} onChange={(e) => setUserName(e.target.value)} />

        <input type="email" name="email" className="df-input my-2" placeholder="Email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <input type="password" name="password" className="df-input my-2" placeholder="Password" required
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <input type="password" name="confirmPassword" className="df-input my-2" placeholder="Confirm Password" required
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <button type="submit" className="btn cta-btn mt-3">Register</button>

        <p className="text-sub-14 text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-hsl-l5 dark:text-hsl-l85 hover:underline">Log In</Link>
        </p>
      </form>
    </main>
  );
}