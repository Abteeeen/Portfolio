import { Boot } from "@/components/film/Boot";
import { Smooth } from "@/components/film/Smooth";
import { Hud } from "@/components/film/Hud";
import { Hero } from "@/components/film/Hero";
import { Running } from "@/components/film/Running";
import { Casework } from "@/components/film/Casework";
import { SystemScreen } from "@/components/film/SystemScreen";
import { Founder } from "@/components/film/Founder";
import { Method } from "@/components/film/Method";
import { PowerOff } from "@/components/film/PowerOff";

export default function Home() {
  return (
    <>
      <Boot />
      <Smooth />
      <Hud />
      <div className="grain" aria-hidden="true" />
      <main id="main">
        <Hero />
        <Running />
        <Casework />
        <SystemScreen />
        <Founder />
        <Method />
        <PowerOff />
      </main>
    </>
  );
}
