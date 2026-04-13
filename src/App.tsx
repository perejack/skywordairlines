import { SkywardNavbar } from "@/components/SkywardNavbar";
import { HeroSection } from "@/components/HeroSection";
import { SmartDeals } from "@/components/SmartDeals";
import { Destinations } from "@/components/Destinations";
import { ServicesSection } from "@/components/ServicesSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SkywardFooter } from "@/components/SkywardFooter";
import { TalkToUs } from "@/components/TalkToUs";

function App() {
  return (
    <div className="min-h-screen">
      <SkywardNavbar />
      <HeroSection />
      <SmartDeals />
      <Destinations />
      <ServicesSection />
      <NewsletterSection />
      <SkywardFooter />
      <TalkToUs />
    </div>
  );
}

export default App;
