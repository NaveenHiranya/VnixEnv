import Link from "next/link";

export default function Header() {
  return (
    <Link href="/home" className="text-white p-4 border-b border-neutral-800 bg-neutral-900">
      <h1 className="text-xl font-bold">ALoHa</h1>
    </Link>
  );
}
