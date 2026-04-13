import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  Settings,
  Clock,
} from "lucide-react";
import heroCrew from "@/assets/hero-crew.jpg";
import heroPlane from "@/assets/hero-plane.jpg";
import heroBeach from "@/assets/hero-beach.jpg";

const slides = [
  {
    image: heroCrew,
    title: "Seamlessly Connecting People,\nPlaces, and Business\n— One Flight at a Time",
  },
  {
    image: heroPlane,
    title: "Fly Across East Africa\nWith Comfort\nand Confidence",
  },
  {
    image: heroBeach,
    title: "Discover Paradise\nAlong the\nKenya Coast",
  },
];

type BookingTab = "flights" | "booking" | "status";
type TripType = "oneway" | "round" | "multi";

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState<BookingTab>("flights");
  const [tripType, setTripType] = useState<TripType>("oneway");

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative">
      {/* Carousel */}
      <div className="relative h-[75vh] sm:h-[80vh] overflow-hidden">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            width={1920}
            height={900}
          />
        ))}
        <div className="absolute inset-0 bg-sky-brand/40" />

        {/* Centered tagline */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading italic text-sky-brand-foreground text-center leading-snug whitespace-pre-line">
            {slide.title}
          </h1>
        </div>

        {/* Carousel arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-sky-cta hover:bg-sky-cta/80 text-sky-cta-foreground p-3 sm:p-4 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-sky-cta hover:bg-sky-cta/80 text-sky-cta-foreground p-3 sm:p-4 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current
                  ? "w-8 bg-sky-cta"
                  : "w-2.5 bg-sky-brand-foreground/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Booking form overlaid at bottom */}
      <div className="relative -mt-24 sm:-mt-28 z-10 mx-auto max-w-5xl px-3 sm:px-6 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto">
          {[
            { key: "flights" as BookingTab, label: "FLIGHTS", icon: PlaneTakeoff },
            { key: "booking" as BookingTab, label: "BOOKING", icon: Settings },
            { key: "status" as BookingTab, label: "STATUS", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-8 py-3 text-[10px] sm:text-sm font-bold tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-sky-cta text-sky-cta-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Booking content */}
        <div className="bg-sky-cta p-5 sm:p-6">
          {activeTab === "flights" && (
            <>
              {/* Trip type */}
              <div className="flex gap-3 mb-5">
                {[
                  { key: "oneway" as TripType, label: "One way" },
                  { key: "round" as TripType, label: "Round trip" },
                  { key: "multi" as TripType, label: "Multi city" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTripType(t.key)}
                    className={`px-5 py-2 rounded-sm text-sm font-semibold border-2 transition-all ${
                      tripType === t.key
                        ? "bg-sky-cta-foreground text-sky-cta border-sky-cta-foreground"
                        : "bg-transparent text-sky-cta-foreground border-sky-cta-foreground/60 hover:border-sky-cta-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="flex items-center gap-3 rounded-sm bg-card p-3">
                  <MapPin className="h-5 w-5 text-sky-cta shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-semibold text-foreground">
                      Nairobi (WIL)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-sm bg-card p-3">
                  <MapPin className="h-5 w-5 text-sky-cta shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="text-sm font-semibold text-foreground">
                      Mombasa (MBA)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-sm bg-card p-3">
                  <CalendarDays className="h-5 w-5 text-sky-cta shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Departure</p>
                    <p className="text-sm font-semibold text-foreground">
                      Select Date
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-sm bg-card p-3">
                  <Users className="h-5 w-5 text-sky-cta shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="text-sm font-semibold text-foreground">
                      1 Adult
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="h-full min-h-[52px] bg-sky-brand text-sky-brand-foreground hover:bg-sky-brand/90 uppercase tracking-widest font-bold text-sm"
                >
                  Search
                </Button>
              </div>
            </>
          )}

          {activeTab === "booking" && (
            <div className="bg-card rounded-sm p-6 text-center">
              <p className="text-muted-foreground">
                Enter your booking reference to manage your reservation.
              </p>
              <div className="mt-4 flex gap-3 max-w-md mx-auto">
                <input
                  placeholder="Booking reference"
                  className="flex-1 rounded-sm border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-cta"
                />
                <Button
                  variant="default"
                  className="bg-sky-brand text-sky-brand-foreground hover:bg-sky-brand/90 uppercase tracking-wider font-bold"
                >
                  Search
                </Button>
              </div>
            </div>
          )}

          {activeTab === "status" && (
            <div className="bg-card rounded-sm p-6 text-center">
              <p className="text-muted-foreground">
                Check the status of your upcoming flight.
              </p>
              <div className="mt-4 flex gap-3 max-w-md mx-auto">
                <input
                  placeholder="Flight number"
                  className="flex-1 rounded-sm border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-cta"
                />
                <Button
                  variant="default"
                  className="bg-sky-brand text-sky-brand-foreground hover:bg-sky-brand/90 uppercase tracking-wider font-bold"
                >
                  Check
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
