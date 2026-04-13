import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SkywardNavbar } from "@/components/SkywardNavbar";
import { HeroSection } from "@/components/HeroSection";
import { SmartDeals } from "@/components/SmartDeals";
import { Destinations } from "@/components/Destinations";
import { ServicesSection } from "@/components/ServicesSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { SkywardFooter } from "@/components/SkywardFooter";
import { TalkToUs } from "@/components/TalkToUs";
import { BookingPage } from "@/components/BookingPage";

function HomePage() {
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
