import FeatureSection from "@/components/FeatureSection";
import HeroSection from "@/components/Herosection";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <div className="mt-20 ">
      <HeroSection></HeroSection>
      <FeatureSection></FeatureSection>
      <HowItWorks></HowItWorks>
      <TestimonialsSection></TestimonialsSection>
    </div>
  );
}
