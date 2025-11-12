import FeatureSection from "@/components/FeatureSection";
import HeroSection from "@/components/Herosection";
import HowItWorks from "@/components/HowItWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import { checkUser } from "@/lib/checkuser";
import { connectDB } from "@/lib/connectDB";




export default async function Home() {
  return (

    <div className="mt-20 ">
      <HeroSection></HeroSection>
      <FeatureSection></FeatureSection>
      <HowItWorks></HowItWorks>
      <TestimonialsSection></TestimonialsSection>
    </div>
  );
}
