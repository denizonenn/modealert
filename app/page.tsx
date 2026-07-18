import Navbar from "@/components/layout/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import SupportedGames from "@/components/landing/supported-games";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <SupportedGames />
      <Features />
      <Footer />
    </main>
  );
}