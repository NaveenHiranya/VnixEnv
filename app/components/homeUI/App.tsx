import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import defaultPng from "@/public/default.png";

type AppProps = {
  name: string;
  src?: string | StaticImageData;
  alt?: string;
  id: string;
};

export default function App({
  src,
  alt = "default image",
  name,
  id,
}: AppProps) {
  return (
    <div className="text-white flex flex-col items-center w-fit">
      <Link href={id}>
        <Image
          className=" bg-neutral-950 rounded-3xl m-2"
          src={src ?? defaultPng}
          alt={alt}
          width={100}
          height={100}
        />
      </Link>

      <p className="text-center">{name}</p>
    </div>
  );
}
