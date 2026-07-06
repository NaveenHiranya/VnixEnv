"use client";
import Header from "./components/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Header />
      <p className="text-white border-l-4 border-amber-400 m-3 p-1 px-3 font-bold">
        Quick Access
      </p>
      <div className="m-3 flex gap-2">
        <Link
          className= "text-white font-bold border p-2 rounded-xl hover:bg-white hover:text-black"
          href="/home"
        >
          Home
        </Link>
        <Link
          className="text-white font-bold border w-max p-2 rounded-xl hover:bg-white hover:text-black"
          href="/CreateApp"
        >Create a app</Link>
      </div>
    </div>
  );
}
