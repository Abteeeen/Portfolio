import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Casework } from "@/components/sections/Casework";
import { Method } from "@/components/sections/Method";
import { Founder } from "@/components/sections/Founder";
import { Toolkit } from "@/components/sections/Toolkit";
import { Ledger } from "@/components/sections/Ledger";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Casework />
        <Method />
        <Founder />
        <Toolkit />
        <Ledger />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
