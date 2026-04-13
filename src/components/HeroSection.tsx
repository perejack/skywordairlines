import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  X,
} from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import heroCrew from "@/assets/hero-crew.jpg";
import heroPlane from "@/assets/hero-plane.jpg";
import heroBeach from "@/assets/hero-beach.jpg";

// Available routes with prices
const AVAILABLE_ROUTES = [
  { from: "Nairobi (WIL)", to: "Mombasa (MBA)", price: "From KSh 5,980" },
  { from: "Nairobi (WIL)", to: "Eldoret (EDL)", price: "From KSh 8,060" },
  { from: "Nairobi (WIL)", to: "Malindi (MYD)", price: "From KSh 8,060" },
  { from: "Nairobi (WIL)", to: "Ukunda (UKA)", price: "From KSh 8,060" },
  { from: "Nairobi (WIL)", to: "Lamu (LAU)", price: "From KSh 10,010" },
  { from: "Nairobi (WIL)", to: "Lodwar (LOK)", price: "From KSh 11,050" },
  { from: "Nairobi (WIL)", to: "Vipingo (VPG)", price: "From KSh 13,260" },
  { from: "Nairobi (WIL)", to: "Dar es Salaam (DAR)", price: "From KSh 18,150" },
  { from: "Mombasa (MBA)", to: "Nairobi (WIL)", price: "From KSh 6,435" },
  { from: "Atlanta (ATL)", to: "Addis Ababa (ADD)", price: "From $1,185" },
  { from: "Washington (DCA)", to: "Addis Ababa (ADD)", price: "From $913" },
  { from: "New York (JFK)", to: "Addis Ababa (ADD)", price: "From $913" },
  { from: "Chicago (ORD)", to: "Addis Ababa (ADD)", price: "From $1,189" },
  { from: "Los Angeles (LAX)", to: "Addis Ababa (ADD)", price: "From $1,174" },
  { from: "Atlanta (ATL)", to: "Johannesburg (JNB)", price: "From $1,568" },
  { from: "Atlanta (ATL)", to: "Lagos (LOS)", price: "From $1,769" },
  { from: "Atlanta (ATL)", to: "Nairobi (NBO)", price: "From $1,986" },
];

const LOCATIONS = [
  "Nairobi (WIL)", "Mombasa (MBA)", "Eldoret (EDL)", "Malindi (MYD)",
  "Ukunda (UKA)", "Lamu (LAU)", "Lodwar (LOK)", "Vipingo (VPG)",
  "Dar es Salaam (DAR)", "Addis Ababa (ADD)", "Johannesburg (JNB)",
  "Lagos (LOS)", "Nairobi (NBO)", "Atlanta (ATL)", "Washington (DCA)",
  "New York (JFK)", "Chicago (ORD)", "Los Angeles (LAX)",
];

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

interface SearchResult {
  from: string;
  to: string;
  price: string;
  date: Date;
}

export function HeroSection() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState<BookingTab>("flights");
  const [tripType, setTripType] = useState<TripType>("oneway");
  
  // Search form state
  const [from, setFrom] = useState("Nairobi (WIL)");
  const [to, setTo] = useState("Mombasa (MBA)");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
                {/* From */}
                <div className="relative">
                  <button
                    onClick={() => setShowFromDropdown(!showFromDropdown)}
                    className="w-full flex items-center gap-3 rounded-sm bg-card p-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-sky-cta shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {from}
                      </p>
                    </div>
                  </button>
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-sm shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-50">
                      {LOCATIONS.filter(l => l !== to).map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setFrom(loc); setShowFromDropdown(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To */}
                <div className="relative">
                  <button
                    onClick={() => setShowToDropdown(!showToDropdown)}
                    className="w-full flex items-center gap-3 rounded-sm bg-card p-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-sky-cta shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {to}
                      </p>
                    </div>
                  </button>
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-sm shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-50">
                      {LOCATIONS.filter(l => l !== from).map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setTo(loc); setShowToDropdown(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Departure Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center gap-3 rounded-sm bg-card p-3 text-left hover:bg-accent/50 transition-colors">
                      <CalendarDays className="h-5 w-5 text-sky-cta shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Departure</p>
                        <p className={cn("text-sm font-semibold truncate", !departureDate && "text-foreground/50")}>
                          {departureDate ? format(departureDate, "dd MMM yyyy") : "Select Date"}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Passengers */}
                <button
                  onClick={() => setPassengers(p => p < 9 ? p + 1 : 1)}
                  className="flex items-center gap-3 rounded-sm bg-card p-3 text-left hover:bg-accent/50 transition-colors"
                >
                  <Users className="h-5 w-5 text-sky-cta shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="text-sm font-semibold text-foreground">
                      {passengers} Adult{passengers > 1 ? "s" : ""}
                    </p>
                  </div>
                </button>

                <Button
                  onClick={() => {
                    setIsSearching(true);
                    setShowResults(true);
                    // Simulate search
                    setTimeout(() => {
                      const matched = AVAILABLE_ROUTES.filter(
                        r => r.from === from && r.to === to
                      );
                      if (matched.length > 0 && departureDate) {
                        setSearchResults(matched.map(r => ({ ...r, date: departureDate })));
                      } else {
                        // Show alternative routes
                        const alternatives = AVAILABLE_ROUTES.filter(
                          r => r.from === from || r.to === to || r.from.includes(from.split(" ")[0]) || r.to.includes(to.split(" ")[0])
                        ).slice(0, 4);
                        setSearchResults(alternatives.map(r => ({ ...r, date: departureDate || new Date() })));
                      }
                      setIsSearching(false);
                    }, 1000);
                  }}
                  disabled={!departureDate}
                  variant="default"
                  className="h-full min-h-[52px] bg-sky-brand text-sky-brand-foreground hover:bg-sky-brand/90 uppercase tracking-widest font-bold text-sm disabled:opacity-50"
                >
                  {isSearching ? <Search className="h-5 w-5 animate-spin" /> : "Search"}
                </Button>
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="mt-4 bg-white rounded-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-sky-brand/10 border-b border-sky-brand/20">
                    <p className="font-semibold text-sm">
                      {searchResults.length > 0 ? `${searchResults.length} Flight${searchResults.length > 1 ? "s" : ""} Found` : "No flights found"}
                    </p>
                    <button
                      onClick={() => setShowResults(false)}
                      className="p-1 hover:bg-sky-brand/20 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <Search className="h-8 w-8 mx-auto animate-spin text-sky-cta mb-2" />
                      <p className="text-sm text-muted-foreground">Searching flights...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((flight, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-cta/10 p-2 rounded-full">
                              <PlaneTakeoff className="h-5 w-5 text-sky-cta" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{flight.from} → {flight.to}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(flight.date, "dd MMM yyyy")} • {passengers} passenger{passengers > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sky-cta">{flight.price}</p>
                            <Button
                              size="sm"
                              onClick={() => navigate("/booking", { state: { from: flight.from, to: flight.to, price: flight.price } })}
                              className="mt-1 bg-sky-cta hover:bg-sky-cta/90 text-white text-xs px-3 py-1 h-auto"
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm">No flights found for this route.</p>
                      <p className="text-xs text-muted-foreground mt-1">Try different locations or dates.</p>
                    </div>
                  )}
                </div>
              )}
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
