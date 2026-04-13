import { useState } from "react";
import { Menu, X, Plane, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SkywardNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-sky-brand text-sky-brand-foreground text-[10px] sm:text-sm py-2 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="font-medium text-center sm:text-left">
            IMPORTANT: Nairobi (JKIA) → Kitale: Now departing from JKIA. Daily.
          </p>
          <div className="flex items-center gap-3">
            <a href="tel:+447446234805" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" />
              +44 7446 234805
            </a>
            <a href="#" className="underline hover:no-underline hidden sm:inline">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 bg-sky-brand/95 backdrop-blur-md border-b border-sky-brand-foreground/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Plane className="h-7 w-7 sm:h-8 sm:w-8 text-sky-cta" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-sky-cta font-bold">
                  Skyward
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sky-brand-foreground font-medium">
                  Airlines
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-1">
              {["About Us", "Destinations", "Travel Information", "Contact Us"].map(
                (item) => (
                  <button
                    key={item}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-sky-brand-foreground/90 hover:text-sky-brand-foreground transition-colors"
                  >
                    {item}
                    {item !== "Contact Us" && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )
              )}
            </div>

            <div className="hidden md:block">
              <Button variant="cta" size="sm" className="px-6">
                BOOK NOW
              </Button>
            </div>

            <button
              className="md:hidden text-sky-brand-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-sky-brand border-t border-sky-brand-foreground/10">
            <div className="px-4 py-4 space-y-2">
              {["About Us", "Destinations", "Travel Information", "Contact Us"].map(
                (item) => (
                  <button
                    key={item}
                    className="block w-full text-left px-4 py-2 text-sm text-sky-brand-foreground/80 hover:text-sky-brand-foreground"
                  >
                    {item}
                  </button>
                )
              )}
              <div className="pt-2 border-t border-sky-brand-foreground/10">
                <Button variant="cta" size="sm" className="w-full">
                  BOOK NOW
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
