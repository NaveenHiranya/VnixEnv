"use client";

import { useEffect, useState } from "react";

import Header from "../components/header";
import App from "../components/homeUI/App";

type AppType = {
  _id: string;
  appName: string;
  userId: string;
  code: string;
};


export default function Home() {
  const [apps, setApps] = useState<AppType[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/appcreate");
        const data = await res.json();
        setApps(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchApps();
  }, []);

  const formatId = (name: string) =>
    "/store/" + name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="h-screen">
      <Header />

      <div className="text-white">
        <div className="mt-4 mx-4 font-bold">System Apps</div>

        <div className="mx-4 flex gap-2 flex-wrap">
          <App name="App Developer" id="/CreateApp2"></App>
          <App name="Documentation" src="/documentation/documentation.png" id="/documentation"></App>
          <App name="Settings" src="/settings/settings2.png" id="/settings"></App>
        </div>

        <div className="mt-4 mx-4 font-bold">Drafts</div>

        <div className="mx-4 flex gap-2 flex-wrap">
          {apps.map((app) => (
            <App
              key={app._id}
              name={app.appName}
              id={formatId(app.appName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}