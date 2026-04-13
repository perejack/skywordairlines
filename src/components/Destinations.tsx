import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import destMombasa from "@/assets/dest-mombasa.jpg";
import destEldoret from "@/assets/dest-eldoret.jpg";
import destMalindi from "@/assets/dest-malindi2.jpg";
import destUkunda from "@/assets/dest-ukunda.jpg";
import destLamu from "@/assets/dest-lamu.jpg";
import destLodwar from "@/assets/dest-lodwar.jpg";
import destVipingo from "@/assets/dest-vipingo2.jpg";
import destDar from "@/assets/dest-dar.jpg";
import destAddis from "@/assets/dest-addis-ababa.jpg";
import destJohannesburg from "@/assets/dest-johannesburg.jpg";
import destLagos from "@/assets/dest-lagos.jpg";
import destNairobi from "@/assets/dest-nairobi2.jpg";
import destWashington from "@/assets/dest-washington.jpg";
import destNewYork from "@/assets/dest-newyork.jpg";
import destChicago from "@/assets/dest-chicago.jpg";
import destLosAngeles from "@/assets/dest-losangeles.jpg";
import destAtlanta from "@/assets/dest-atlanta.jpg";

export interface RouteInfo {
  from: string;
  to: string;
  price: string;
  image: string;
}

const domesticRoutes: RouteInfo[] = [
  { from: "Nairobi", to: "Mombasa", price: "From KSh 5,980", image: destMombasa },
  { from: "Nairobi", to: "Eldoret", price: "From KSh 8,060", image: destEldoret },
  { from: "Nairobi", to: "Malindi", price: "From KSh 8,060", image: destMalindi },
  { from: "Nairobi", to: "Ukunda (Diani)", price: "From KSh 8,060", image: destUkunda },
  { from: "Nairobi", to: "Lamu", price: "From KSh 10,010", image: destLamu },
  { from: "Nairobi", to: "Lodwar", price: "From KSh 11,050", image: destLodwar },
  { from: "Nairobi", to: "Vipingo Ridge", price: "From KSh 13,260", image: destVipingo },
  { from: "Nairobi", to: "Dar es Salaam", price: "From KSh 18,150", image: destDar },
];

const internationalRoutes: RouteInfo[] = [
  { from: "Atlanta", to: "Addis Ababa", price: "From $1,185", image: destAddis },
  { from: "Washington D.C.", to: "Addis Ababa", price: "From $913", image: destWashington },
  { from: "New York", to: "Addis Ababa", price: "From $913", image: destNewYork },
  { from: "Chicago", to: "Addis Ababa", price: "From $1,189", image: destChicago },
  { from: "Los Angeles", to: "Addis Ababa", price: "From $1,174", image: destLosAngeles },
  { from: "Atlanta", to: "Johannesburg", price: "From $1,568", image: destJohannesburg },
  { from: "Atlanta", to: "Lagos", price: "From $1,769", image: destLagos },
  { from: "Atlanta", to: "Nairobi", price: "From $1,986", image: destNairobi },
];

function RouteCard({
  route,
  className = "",
  onBook,
}: {
  route: RouteInfo;
  className?: string;
  onBook: () => void;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg ${className}`}>
      <img
        src={route.image}
        alt={`${route.from} to ${route.to}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-brand/70 via-sky-brand/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <p className="text-[10px] sm:text-xs text-sky-brand-foreground/70 font-semibold tracking-wider uppercase">
          {route.from}
        </p>
        <h3 className="text-lg sm:text-2xl font-heading text-sky-brand-foreground font-bold tracking-widest mt-1">
          {route.to.toUpperCase()}
        </h3>
        <p className="text-base sm:text-xl font-bold text-sky-cta font-heading mt-1 drop-shadow-lg">
          {route.price}
        </p>
        <Button variant="cta" size="sm" className="mt-3" onClick={onBook}>
          BOOK NOW
        </Button>
      </div>
    </div>
  );
}

function TwoColRow({
  routes: rowRoutes,
  largeFirst = false,
  onBook,
}: {
  routes: RouteInfo[];
  largeFirst?: boolean;
  onBook: (route: RouteInfo) => void;
}) {
  const [a, b] = rowRoutes;
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <div className={largeFirst ? "md:col-span-3" : "md:col-span-2"}>
        <RouteCard route={a} className="aspect-[4/3]" onBook={() => onBook(a)} />
      </div>
      <div className={largeFirst ? "md:col-span-2" : "md:col-span-3"}>
        <RouteCard route={b} className="aspect-[4/3]" onBook={() => onBook(b)} />
      </div>
    </div>
  );
}

export function Destinations() {
  const navigate = useNavigate();

  const handleBook = (route: RouteInfo) => {
    navigate("/booking", { state: route });
  };

  const dRows = [
    domesticRoutes.slice(0, 2),
    domesticRoutes.slice(2, 4),
    domesticRoutes.slice(4, 6),
    domesticRoutes.slice(6, 8),
  ];

  const iRows = [
    internationalRoutes.slice(0, 2),
    internationalRoutes.slice(2, 4),
    internationalRoutes.slice(4, 6),
    internationalRoutes.slice(6, 8),
  ];

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-sky-light overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Domestic */}
        <h2 className="text-2xl sm:text-4xl font-heading text-center text-sky-brand mb-3 sm:mb-4 italic">
          Domestic Routes
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Fly across Kenya and East Africa with unbeatable fares.
        </p>

        {dRows.map((row, i) => (
          <TwoColRow key={`d${i}`} routes={row} largeFirst={i % 2 === 1} onBook={handleBook} />
        ))}

        {/* International */}
        <h2 className="text-2xl sm:text-4xl font-heading text-center text-sky-brand mb-3 sm:mb-4 italic mt-12 sm:mt-20">
          International Routes
        </h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Connecting the US to Africa at unbeatable prices.
        </p>

        {iRows.map((row, i) => (
          <TwoColRow key={`i${i}`} routes={row} largeFirst={i % 2 === 1} onBook={handleBook} />
        ))}
      </div>

    </section>
  );
}
