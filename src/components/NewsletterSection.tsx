import { useState } from "react";
import { Button } from "@/components/ui/button";
import newsletterBg from "@/assets/newsletter-bg.jpg";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <img
        src={newsletterBg}
        alt="Tropical coastline"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={600}
      />
      <div className="absolute inset-0 bg-sky-brand/60 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="text-3xl sm:text-4xl font-heading text-sky-brand-foreground italic leading-snug">
            Sign up to receive
            <br />
            our latest offers and news
          </h2>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <p className="text-sky-brand-foreground/80 mb-4">
            Subscribe and be the first to receive news and exclusive offers.
          </p>
          <label className="text-xs text-sky-brand-foreground/60 uppercase tracking-wider">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="mt-2 w-full rounded-lg border-0 bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-sky-cta outline-none"
          />
          <Button variant="cta" className="mt-4 w-full sm:w-auto px-12">
            SIGN UP
          </Button>
        </div>
      </div>
    </section>
  );
}
