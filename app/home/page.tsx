import Header from "../components/header";
import App from "../components/homeUI/App";

export default function Home() {
  return (
    <div className="h-screen">
      <Header />
      <div className="text-white">
        <div className="mt-4 mx-4 font-bold">System Apps</div>
        <div className="mx-4 flex gap-2 flex-wrap">
          <App name="App Developer" id="/CreateApp2"></App>
          <App name="Documentation" src="/documentation/documentation.png" id="/documentation"></App>
          <App name="Settings" src="/settings/settings2.png" id="/settings"></App>
          {/* <App name="Empty" id="/Empty"></App> */}
        </div>
      </div>
    </div>
  );
}
