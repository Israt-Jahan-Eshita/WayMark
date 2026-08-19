import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ResultsCarousel from "@/components/ResultsCarousel";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center">
      <Hero />
      <HowItWorks />
      <ResultsCarousel />
    </main>
  );
}
