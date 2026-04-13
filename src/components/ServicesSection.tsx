import { Armchair, Luggage, Footprints, Package, PlaneTakeoff } from "lucide-react";

const services = [
  {
    icon: Armchair,
    title: "LOUNGE ACCESS",
    desc: "Relax in style before your flight with exclusive access to our premium lounges.",
  },
  {
    icon: Luggage,
    title: "EXTRA BAGGAGE",
    desc: "Pack everything you need without worry by adding extra baggage to your booking.",
  },
  {
    icon: Footprints,
    title: "LEGROOM",
    desc: "For greater comfort on your flight, all you need to do is pick your favorite seat in advance.",
  },
  {
    icon: Package,
    title: "PARCELS",
    desc: "Deliver joy, essentials, or peace of mind with same-day parcel service.",
  },
  {
    icon: PlaneTakeoff,
    title: "CHARTER SERVICES",
    desc: "Fly on your schedule with a private charter tailored to your travel needs.",
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-heading text-center text-foreground mb-14 italic">
          Complement Your Journey
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="group text-center cursor-pointer"
            >
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-sky-brand/20 text-sky-brand mb-4 transition-all group-hover:border-sky-cta group-hover:text-sky-cta group-hover:scale-110 group-hover:shadow-lg">
                <svc.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-2 uppercase">
                {svc.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
