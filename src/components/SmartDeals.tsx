import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dealMalindi from "@/assets/deal-malindi.jpg";
import dealNairobi from "@/assets/deal-nairobi.jpg";
import dealLounge from "@/assets/deal-lounge.jpg";

interface DealInfo {
  image: string;
  tag: string;
  title: string;
  cta: string;
  route?: {
    from: string;
    to: string;
    price: string;
  };
}

const deals: DealInfo[] = [
  {
    image: dealMalindi,
    tag: "MALINDI, NOW DAILY",
    title: "New Afternoon Departure from Wilson Airport.",
    cta: "BOOK NOW",
    route: { from: "Nairobi (Wilson)", to: "Malindi", price: "From KSh 8,060" },
  },
  {
    image: dealNairobi,
    tag: "FLY FROM MOMBASA TO NAIROBI",
    title: "From Ksh 6,435",
    cta: "BOOK NOW",
    route: { from: "Mombasa", to: "Nairobi", price: "From KSh 6,435" },
  },
  {
    image: dealLounge,
    tag: "EXPERIENCE OUR",
    title: "Ebari CIP Lounge",
    cta: "EXPLORE",
  },
];

export function SmartDeals() {
  const navigate = useNavigate();

  const handleBook = (deal: DealInfo) => {
    if (deal.route) {
      navigate("/booking", { state: deal.route });
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-heading text-center text-foreground mb-12 italic">
          Skyward Smart Deals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((deal, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
            >
              <img
                src={deal.image}
                alt={deal.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-brand/80 via-sky-brand/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-widest text-sky-brand-foreground/70 mb-1">
                  {deal.tag}
                </p>
                <h3 className="text-xl sm:text-2xl font-heading text-sky-brand-foreground font-semibold italic mb-4">
                  {deal.title}
                </h3>
                <Button
                  variant="cta"
                  size="sm"
                  onClick={() => handleBook(deal)}
                >
                  {deal.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
