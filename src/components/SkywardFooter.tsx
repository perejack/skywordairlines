import { Plane } from "lucide-react";

const footerLinks = [
  {
    title: "Where We Fly",
    links: ["Fly to Dar es Salaam", "Fly to Mombasa", "Fly to Lamu", "Fly to Eldoret", "Fly to Ukunda"],
  },
  {
    title: "Travel Information",
    links: ["Baggage Policy", "Check-in", "FAQs", "Travel Documents", "Special Assistance"],
  },
  {
    title: "About Us",
    links: ["Careers", "Our Fleet", "News & Media", "Sustainability", "Partners"],
  },
  {
    title: "Contact Info",
    links: ["Skyward Airlines Ltd", "+254 711 002 222", "info@skywardexpress.com", "Wilson Airport, Nairobi"],
  },
];

export function SkywardFooter() {
  return (
    <footer className="bg-sky-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-lg font-heading text-sky-dark-foreground mb-3">
                {col.title}
              </h3>
              <div className="w-8 h-0.5 bg-sky-cta mb-4" />
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-sky-dark-foreground/60 hover:text-sky-dark-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-sky-dark-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-cta" />
            <span className="text-sm font-bold text-sky-dark-foreground tracking-wide">
              Skyward Airlines
            </span>
          </div>
          <p className="text-xs text-sky-dark-foreground/40">
            © 2026 Skyward Airlines. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
