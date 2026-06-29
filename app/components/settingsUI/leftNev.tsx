"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavProps = {
  selected: string;
};

export default function LeftNav({ selected }: NavProps) {
  const navClass = (name: string) =>
    `mx-4 px-3 py-1 font-semibold text-sm transition-all duration-10 ${
      selected === name
        ? "text-white border-l-3 hover:bg-neutral-800"
        : "text-gray-100 hover:bg-neutral-800"
    }`;

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const res = await fetch("/api/me");

      if (!res.ok) return;

      const data = await res.json();
      setUser(data.user);
    }

    getUser();
  }, []);
  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col">
      <p className="mx-4 my-2 text-xl font-bold">Settings</p>

      <div className="flex flex-col items-center mb-4">
        <div className="w-15 h-15 rounded-full border"></div>
        {user ? <p className="mt-2 font-bold">{user.name}</p> : <Link href="/login" className={navClass("login")}>
        Sign In
      </Link>}
        
      </div>

      <Link href="/settings" className={navClass("home")}>
        Home
      </Link>
      
      

      <Link href="/settings/profile" className={navClass("profile")}>
        Edit Profile
      </Link>

      <Link href="/settings/llm" className={navClass("llm")}>
        LLM Settings
      </Link>
    </div>
  );
}
