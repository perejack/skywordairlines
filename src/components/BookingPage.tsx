import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  CalendarDays,
  Mail,
  Phone,
  PlaneTakeoff,
  CreditCard,
  CheckCircle2,
  Loader2,
  Search,
  MapPin,
  Clock,
  ArrowLeft,
  Download,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  initiateSTKPush,
  pollTransactionStatus,
  generateTransactionReference,
} from "@/lib/hashback-api";
import html2canvas from "html2canvas";

const STEPS = ["details", "searching", "found", "mpesa_phone", "processing", "payment_failed", "ticket"] as const;
type Step = (typeof STEPS)[number];

interface BookingData {
  from: string;
  to: string;
  price: string;
}

export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state as BookingData | null;

  const [step, setStep] = useState<Step>("details");
  const [dob, setDob] = useState<Date>();
  const [travelDate, setTravelDate] = useState<Date>();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
  });
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [checkoutId, setCheckoutId] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!route) {
      navigate("/");
    }
  }, [route, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("searching");
    setSearchProgress(0);

    const interval = setInterval(() => {
      setSearchProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep("found");
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  const handlePayMpesa = async () => {
    if (!route || !mpesaPhone.trim()) return;

    setLoading(true);
    setPaymentError("");
    setStep("processing");

    try {
      const reference = generateTransactionReference();
      setTransactionRef(reference);

      const amount = route?.price?.replace(/[^0-9]/g, "") || "";

      const stkResponse = await initiateSTKPush(amount, mpesaPhone, reference);

      if (stkResponse.CheckoutRequestID) {
        setCheckoutId(stkResponse.CheckoutRequestID);

        pollTransactionStatus(stkResponse.CheckoutRequestID, 20, 3000)
          .then((status) => {
            if (status.ResultCode === "0") {
              setStep("ticket");
            } else {
              setPaymentError(status.ResultDesc || "Payment failed");
              setStep("payment_failed");
            }
          })
          .catch((error) => {
            console.error("Payment polling error:", error);
            setPaymentError("Payment verification timed out.");
            setStep("payment_failed");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        throw new Error("Failed to initiate STK push");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error instanceof Error ? error.message : "Payment failed");
      setStep("payment_failed");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const ticketElement = document.getElementById("boarding-pass");
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `Skyward-Airlines-Boarding-Pass-${transactionRef}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate ticket image:", error);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const flightTime =
    route?.to?.includes("Addis") ||
    route?.to?.includes("Johannesburg") ||
    route?.to?.includes("Lagos") ||
    route?.to?.includes("Nairobi")
      ? `${Math.floor(Math.random() * 5 + 6)}h ${Math.floor(Math.random() * 50 + 10)}m`
      : `${Math.floor(Math.random() * 2 + 1)}h ${Math.floor(Math.random() * 40 + 10)}m`;

  if (!route) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-light/30 via-background to-sky-brand/10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-cta/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sky-cta hover:text-sky-brand transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Back</span>
            </button>
            <div className="flex items-center gap-1">
              {STEPS.slice(0, 5).map((s, i) => (
                <div
                  key={s}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    STEPS.indexOf(step) >= i ? "bg-sky-cta" : "bg-sky-cta/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Title */}
        <h1 className="font-heading text-2xl sm:text-3xl text-center mb-6">
          {step === "details" && "Passenger Details"}
          {step === "searching" && "Searching Flights..."}
          {step === "found" && "Flight Found!"}
          {step === "mpesa_phone" && "M-Pesa Payment"}
          {step === "processing" && "Processing Payment"}
          {step === "payment_failed" && "Payment Failed"}
          {step === "ticket" && "Booking Confirmed!"}
        </h1>

        {/* Route Card */}
        <div className="bg-gradient-to-r from-sky-brand/20 to-sky-cta/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-sky-cta/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-sky-cta/20 p-2 rounded-xl flex-shrink-0">
              <PlaneTakeoff className="h-5 w-5 text-sky-cta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm sm:text-base truncate">
                {route.from} → {route.to}
              </p>
              <p className="text-xs text-muted-foreground">Direct Flight</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sky-cta text-base sm:text-lg">{route.price}</p>
              <p className="text-xs text-muted-foreground">Per person</p>
            </div>
          </div>
        </div>

        {/* Step 1: Details Form */}
        {step === "details" && (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base text-left outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta relative",
                    !dob && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <span className="flex items-center justify-between">
                    {dob ? format(dob, "PPP") : "Date of Birth"}
                    <span className="text-xs">📅</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta"
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (0712345678)"
                required
                className="w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base text-left outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta relative",
                    !travelDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <span className="flex items-center justify-between">
                    {travelDate ? format(travelDate, "PPP") : "Travel Date"}
                    <span className="text-xs">📅</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={setTravelDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="relative group">
              <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                placeholder="ID / Passport Number"
                required
                className="w-full rounded-xl border border-input bg-white pl-10 pr-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta"
              />
            </div>

            <Button
              type="submit"
              disabled={!dob || !travelDate}
              className="w-full bg-gradient-to-r from-sky-cta to-sky-brand text-white font-bold rounded-xl py-4 text-base shadow-lg disabled:opacity-50"
            >
              <Search className="h-5 w-5 mr-2" />
              SEARCH FLIGHTS
            </Button>
          </form>
        )}

        {/* Step 2: Searching */}
        {step === "searching" && (
          <div className="text-center py-12 space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-cta border-r-sky-brand animate-spin" />
              <div className="absolute inset-2 rounded-full bg-sky-cta/10 flex items-center justify-center">
                <Search className="h-10 w-10 text-sky-cta animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium">Searching for flights...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Checking {Math.min(Math.floor(searchProgress), 100)}% of routes
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Flight Found */}
        {step === "found" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sky-brand/10 via-sky-cta/10 to-sky-brand/10 rounded-2xl p-6 border border-sky-cta/30">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-bold">Flight Available!</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-xs text-muted-foreground">FROM</p>
                  <p className="font-bold mt-1">{route.from}</p>
                  <p className="text-xs text-muted-foreground mt-1">Terminal 1</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <PlaneTakeoff className="h-6 w-6 text-sky-cta mb-2" />
                  <p className="text-xs text-muted-foreground">{flightTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TO</p>
                  <p className="font-bold mt-1">{route.to}</p>
                  <p className="text-xs text-muted-foreground mt-1">Terminal 2</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">DATE</p>
                  <p className="font-semibold">{travelDate ? format(travelDate, "dd MMM yyyy") : "—"}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">PASSENGER</p>
                  <p className="font-semibold truncate">{form.fullName || "—"}</p>
                </div>
                <div className="bg-sky-cta/10 rounded-lg p-3 text-center col-span-2">
                  <p className="text-xs text-muted-foreground">PRICE</p>
                  <p className="font-bold text-sky-cta text-lg">{route.price}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("mpesa_phone")}
              className="w-full bg-gradient-to-r from-sky-cta to-sky-brand text-white font-bold rounded-xl py-4 text-base shadow-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              BOOK FLIGHT
            </Button>

            <button
              onClick={() => setStep("details")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to details
            </button>
          </div>
        )}

        {/* Step 4: M-Pesa Phone */}
        {step === "mpesa_phone" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <p className="font-bold text-lg">Enter M-Pesa Number</p>
              <p className="text-sm text-muted-foreground mt-2">
                You'll receive an STK push on this number
              </p>
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full rounded-xl border border-input bg-white pl-10 pr-4 py-4 text-center text-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <Button
              onClick={handlePayMpesa}
              disabled={!mpesaPhone.trim() || loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl py-4 text-base shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <span className="mr-2">💰</span>}
              PAY {route.price}
            </Button>

            <button
              onClick={() => setStep("found")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 5: Processing */}
        {step === "processing" && (
          <div className="text-center py-12 space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-green-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-green-400 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">Processing Payment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check your phone and enter M-Pesa PIN
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ref: {transactionRef}
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Payment Failed */}
        {step === "payment_failed" && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="font-bold text-lg text-red-600">Payment Failed</p>
              <p className="text-sm text-muted-foreground mt-2">{paymentError}</p>
            </div>

            <Button
              onClick={() => setStep("mpesa_phone")}
              variant="outline"
              className="w-full rounded-xl py-4"
            >
              Try Again
            </Button>

            <button
              onClick={() => navigate("/")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        )}

        {/* Step 7: Ticket */}
        {step === "ticket" && (
          <div className="space-y-6">
            <div
              id="boarding-pass"
              className="bg-gradient-to-br from-sky-brand via-sky-brand/90 to-sky-dark rounded-2xl overflow-hidden text-white shadow-2xl"
            >
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">SKYWARD AIRLINES</p>
                    <p className="font-bold text-xl mt-1">BOARDING PASS</p>
                  </div>
                  <div className="bg-green-500 p-2 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-xs opacity-80">FROM</p>
                    <p className="font-bold text-lg">{route.from}</p>
                  </div>
                  <div className="text-center px-4">
                    <PlaneTakeoff className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-xs opacity-80">{flightTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs opacity-80">TO</p>
                    <p className="font-bold text-lg">{route.to}</p>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Passenger</span>
                    <span className="font-semibold">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Date</span>
                    <span className="font-semibold">
                      {travelDate ? format(travelDate, "dd MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Ref</span>
                    <span className="font-mono text-xs">{transactionRef}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Amount</span>
                    <span className="font-bold">{route.price}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 text-center text-xs opacity-80">
                <p>✈️ Present this at check-in ✈️</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1 rounded-xl py-4"
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-sky-cta to-sky-brand text-white rounded-xl py-4 shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
