import LeftNev from "../components/settingsUI/leftNev";

export default function settings() {
  return (
    <div className="text-white flex h-screen w-full">
      <div className=" flex flex-col flex-2 md:flex-1 border-r border-neutral-800">
        <LeftNev selected="home"/>
      </div>
      <div className="flex-3 md:flex-5 flex flex-col">
        <div>
            <p className="text-center mt-4 text-2xl md:text-4xl">WELCOME TO VNIXENV!</p>
        </div>
        <p className="m-3">Whats New !</p>
      </div>
    </div>
  );
}
