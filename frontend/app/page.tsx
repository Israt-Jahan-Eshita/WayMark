import Hero from "@/components/Hero";
import WhyWayMark from "@/components/WhyWayMark";
import HowItWorks from "@/components/HowItWorks";
import ResultsCarousel from "@/components/ResultsCarousel";
import PublicMapSection from "@/components/PublicMapSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center min-h-screen">
      <Hero />
      <WhyWayMark />
      <PublicMapSection />
      <HowItWorks />
      <ResultsCarousel />
      <Footer />
    </main>
  );
}
