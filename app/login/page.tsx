
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const endpoint = isSignUp
      ? "/api/auth/signup"
      : "/api/auth/signin";

    const body = isSignUp
      ? { name, email, password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/settings");
        return;
      }

      if (data.message === "User not found") {
        setError(
          "User not found. Please check your email or create a new account."
        );
      } else if (data.message === "Wrong password") {
        setError("Incorrect password.");
      } else if (data.message === "User already exists") {
        setError("This email is already registered. Please sign in.");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (error) {
      setError("Unable to connect to the server.");
    }
  };

  return (
    <div className="bg-black h-screen flex items-center justify-center">
      <div className="bg-neutral-700 text-white w-96 p-6 rounded-xl">

        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        <div className="flex flex-col gap-3 mt-6">

          {isSignUp && (
            <>
              <label>Name</label>
              <input
                className="border-b bg-transparent outline-none"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <label>Email</label>
          <input
            className="border-b bg-transparent outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            className="border-b bg-transparent outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="mt-6 border py-2 rounded hover:bg-white hover:text-black transition"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center mt-2">
              {error}
            </p>
          )}

          <p className="text-center mt-4">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="ml-2 text-blue-400 underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

