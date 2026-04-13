import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  CalendarDays,
  Mail,
  Phone,
  PlaneTakeoff,
  CreditCard,
  CheckCircle2,
  Loader2,
  Download,
  MessageCircle,
  Search,
  MapPin,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initiateSTKPush, pollTransactionStatus, generateTransactionReference, isValidPhoneNumber } from "@/lib/hashback-api";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: { from: string; to: string; price: string } | null;
}

type Step = "details" | "searching" | "found" | "mpesa_phone" | "payment" | "processing" | "ticket" | "payment_failed";

const STEPS: Step[] = ["details", "searching", "found", "mpesa_phone", "payment", "processing", "ticket"];

function StepIndicator({ step }: { step: Step }) {
  const labels = ["Details", "Search", "Flight", "Phone", "Pay", "Processing", "Ticket"];
  const currentIdx = STEPS.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-1 mb-6 px-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-500 shadow-lg",
              i === currentIdx && "bg-gradient-to-r from-sky-cta to-sky-brand text-white scale-110 shadow-sky-cta/50 animate-pulse",
              i < currentIdx && "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/50",
              i > currentIdx && "bg-muted/80 text-muted-foreground backdrop-blur-sm"
            )}
          >
            {i < currentIdx ? "✓" : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "w-6 sm:w-8 h-1 transition-all duration-500 rounded-full",
              i < currentIdx ? "bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/50" : "bg-muted/60"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

export function BookingModal({ open, onOpenChange, route }: BookingModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
  });
  const [dob, setDob] = useState<Date>();
  const [travelDate, setTravelDate] = useState<Date>();
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [searchProgress, setSearchProgress] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [checkoutId, setCheckoutId] = useState("");
  const [transactionRef, setTransactionRef] = useState("");

  const ticketRef = `SKY-${Date.now().toString(36).toUpperCase()}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob || !travelDate) return;
    setStep("searching");
  };

  // Flight search simulation
  useEffect(() => {
    if (step !== "searching") return;
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("found"), 400);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [step]);

  const handlePayMpesa = async () => {
    if (!route || !mpesaPhone.trim()) return;
    
    setLoading(true);
    setPaymentError("");
    setStep("processing");
    
    try {
      // Generate unique transaction reference
      const reference = generateTransactionReference();
      setTransactionRef(reference);
      
      // Extract numeric amount from price (remove KSh and any commas)
      const amount = route.price.replace(/[^0-9]/g, '');
      
      // Initiate STK Push
      const stkResponse = await initiateSTKPush(amount, mpesaPhone, reference);
      
      if (stkResponse.CheckoutRequestID) {
        setCheckoutId(stkResponse.CheckoutRequestID);
        
        // Start polling for transaction status
        pollTransactionStatus(stkResponse.CheckoutRequestID, 20, 3000)
          .then((status) => {
            if (status.ResultCode === "0") {
              // Payment successful
              setStep("ticket");
            } else {
              // Payment failed
              setPaymentError(status.ResultDesc || "Payment failed");
              setStep("payment_failed");
            }
          })
          .catch((error) => {
            console.error("Payment polling error:", error);
            setPaymentError("Payment verification timed out. Please contact support.");
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

  const handleDownload = () => {
    if (!route) return;
    
    // Create ticket content as text
    const ticketContent = `
SKYWARD AIRLINES - BOARDING PASS
=====================================

Flight: ${route.from} → ${route.to}
Date: ${travelDate ? format(travelDate, "dd MMM yyyy") : "—"}
Time: ${flightTime}
Passenger: ${form.fullName}
Ticket Reference: ${ticketRef}
Amount Paid: ${route.price}
ID/Passport: ${form.idNumber}
Email: ${form.email}

From: ${route.from} (Terminal 1)
To: ${route.to} (Terminal 2)

Please present this ticket at check-in. Safe travels! ✈️
=====================================
    `;

    // Create a blob and download
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skyward_Ticket_${ticketRef}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleClose = () => {
    setStep("details");
    setForm({ fullName: "", email: "", phone: "", idNumber: "" });
    setDob(undefined);
    setTravelDate(undefined);
    setMpesaPhone("");
    setSearchProgress(0);
    setPaymentError("");
    setCheckoutId("");
    setTransactionRef("");
    onOpenChange(false);
  };

  const flightTime = route?.to.includes("Addis") || route?.to.includes("Johannesburg") || route?.to.includes("Lagos") || route?.to.includes("Nairobi")
    ? `${Math.floor(Math.random() * 5 + 6)}h ${Math.floor(Math.random() * 50 + 10)}m`
    : `${Math.floor(Math.random() * 2 + 1)}h ${Math.floor(Math.random() * 40 + 10)}m`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-background via-background to-sky-light/30 backdrop-blur-sm border-0 shadow-2xl">
        <StepIndicator step={step} />

        <DialogHeader>
          <DialogTitle className="font-heading text-center text-lg sm:text-xl">
            {step === "details" && "Passenger Details"}
            {step === "searching" && "Searching Flights..."}
            {step === "found" && "Flight Found! ✈️"}
            {step === "mpesa_phone" && "M-Pesa Phone Number"}
            {step === "payment" && "M-Pesa Payment"}
            {step === "processing" && "Processing Payment..."}
            {step === "payment_failed" && "Payment Failed"}
            {step === "ticket" && "Booking Confirmed! 🎉"}
          </DialogTitle>
        </DialogHeader>

        {/* Route banner */}
        <div className="bg-gradient-to-r from-sky-brand/20 to-sky-cta/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between text-sm border border-sky-cta/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-sky-cta/20 p-2 rounded-xl">
              <PlaneTakeoff className="h-5 w-5 text-sky-cta" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm sm:text-base block">
                {route.from} → {route.to}
              </span>
              <span className="text-xs text-muted-foreground">Direct Flight</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-sky-cta text-base sm:text-lg block">{route.price}</span>
            <span className="text-xs text-muted-foreground">Per person</span>
          </div>
        </div>

        {/* Step 1: Details */}
        {step === "details" && (
          <form onSubmit={handleSubmitDetails} className="space-y-4 mt-4">
            <div className="relative group">
              <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name (as on passport/ID)"
                required
                className="w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            {/* DOB Calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base text-left outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta relative transition-all duration-300 shadow-sm hover:shadow-md group",
                    !dob && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
                  <span className="flex items-center justify-between w-full">
                    {dob ? format(dob, "PPP") : "Date of Birth"}
                    <span className="text-xs text-muted-foreground">📅</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                  captionLayout="dropdown"
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <div className="relative group">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number (e.g. 0712345678)"
                required
                className="w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Travel Date Calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base text-left outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta relative transition-all duration-300 shadow-sm hover:shadow-md group",
                    !travelDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
                  <span className="flex items-center justify-between w-full">
                    {travelDate ? format(travelDate, "PPP") : "Travel Date"}
                    <span className="text-xs text-muted-foreground">✈️</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={setTravelDate}
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <div className="relative group">
              <CreditCard className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-sky-cta transition-colors" />
              <input
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                placeholder="Passport / Government ID Number"
                required
                className="w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-sky-cta focus:border-sky-cta transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            <Button
              type="submit"
              disabled={!dob || !travelDate}
              className="w-full bg-gradient-to-r from-sky-cta to-sky-brand text-white hover:from-sky-cta/90 hover:to-sky-brand/90 font-bold tracking-wider rounded-2xl py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                SEARCH FLIGHTS
              </span>
            </Button>
          </form>
        )}

        {/* Step 2: Searching simulation */}
        {step === "searching" && (
          <div className="mt-6 space-y-6 text-center py-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-cta border-r-sky-brand animate-spin"
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sky-cta/20 to-sky-brand/20 flex items-center justify-center">
                <Search className="h-10 w-10 text-sky-cta animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-heading font-bold text-foreground text-xl">
                Searching for flights...
              </p>
              <p className="text-sm text-muted-foreground">
                {route.from} → {route.to}
              </p>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-sky-cta via-sky-brand to-sky-cta rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(searchProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground animate-pulse">
              Checking {Math.min(Math.floor(searchProgress), 100)}% of available flights...
            </p>
          </div>
        )}

        {/* Step 3: Flight found */}
        {step === "found" && (
          <div className="mt-4 space-y-4">
            <div className="bg-gradient-to-br from-sky-brand/10 via-sky-cta/10 to-sky-brand/10 backdrop-blur-sm border border-sky-cta/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <span className="font-bold text-base">Flight Available!</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-medium">FROM</p>
                  <p className="font-heading font-bold text-foreground text-lg mt-1">{route.from}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Terminal 1
                  </p>
                </div>
                <div className="flex-1 flex flex-col items-center px-3">
                  <div className="bg-sky-cta/20 p-2 rounded-full">
                    <PlaneTakeoff className="h-6 w-6 text-sky-cta" />
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-sky-cta to-sky-brand my-2 rounded-full" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Clock className="h-3 w-3" />
                    {flightTime}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-medium">TO</p>
                  <p className="font-heading font-bold text-foreground text-lg mt-1">{route.to}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Terminal 2
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm border-t border-border/50 pt-4">
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium">DATE</p>
                  <p className="font-semibold text-foreground mt-1">{travelDate ? format(travelDate, "dd MMM yyyy") : "—"}</p>
                </div>
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium">PASSENGER</p>
                  <p className="font-semibold text-foreground mt-1 truncate">{form.fullName || "—"}</p>
                </div>
                <div className="bg-sky-cta/10 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium">PRICE</p>
                  <p className="font-bold text-sky-cta mt-1">{route.price}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("mpesa_phone")}
              className="w-full bg-gradient-to-r from-sky-cta to-sky-brand text-white hover:from-sky-cta/90 hover:to-sky-brand/90 font-bold tracking-wider rounded-2xl py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                BOOK FLIGHT
              </span>
            </Button>
            <button
              onClick={() => setStep("details")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
            >
              ← Back to details
            </button>
          </div>
        )}

        {/* Step 4: M-Pesa phone number */}
        {step === "mpesa_phone" && (
          <div className="mt-4 space-y-4">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-600/30 rounded-3xl p-6 text-center space-y-4">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">📱</span>
              </div>
              <p className="font-heading font-bold text-xl text-foreground">Enter M-Pesa Number</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Enter the phone number to receive the M-Pesa STK push payment request.
              </p>
              <div className="relative max-w-xs mx-auto">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <input
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="w-full rounded-2xl border border-input/60 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-4 text-base text-center outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
                <p>💡 You'll receive an STK prompt on this number</p>
              </div>
            </div>
            <Button
              onClick={() => { if (mpesaPhone.trim()) setStep("payment"); }}
              disabled={!mpesaPhone.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold tracking-wider rounded-2xl py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              CONTINUE
            </Button>
            <button
              onClick={() => setStep("found")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 5: M-Pesa Payment */}
        {step === "payment" && (
          <div className="space-y-4 mt-4 text-center">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-600/30 rounded-3xl p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <p className="font-heading font-bold text-xl text-foreground">M-Pesa STK Push</p>
              <p className="text-sm text-muted-foreground mt-2">
                A payment prompt will be sent to:
              </p>
              <div className="bg-background/50 rounded-2xl p-4 mt-3">
                <p className="font-bold text-foreground text-lg">{mpesaPhone}</p>
              </div>
              <div className="bg-sky-cta/10 rounded-2xl p-4 mt-3">
                <p className="text-xs text-muted-foreground">Amount to Pay</p>
                <p className="font-bold text-sky-cta text-2xl mt-1">{route?.price}</p>
              </div>
            </div>
            <Button
              onClick={handlePayMpesa}
              disabled={loading || !isValidPhoneNumber(mpesaPhone)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold tracking-wider py-6 text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  PAY WITH M-PESA
                </span>
              )}
            </Button>
            <button
              onClick={() => setStep("mpesa_phone")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              ← Change number
            </button>
          </div>
        )}

        {/* Step 6: Processing Payment */}
        {step === "processing" && (
          <div className="space-y-6 mt-6 text-center py-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-green-700 animate-spin"
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <Phone className="h-10 w-10 text-green-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-heading font-bold text-foreground text-xl">
                Processing Payment...
              </p>
              <p className="text-sm text-muted-foreground">
                Waiting for M-Pesa confirmation
              </p>
              <p className="text-xs text-muted-foreground">
                Transaction Reference: {transactionRef}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Please check your phone</span>
              </div>
              <p className="text-xs text-amber-700">
                Enter your M-Pesa PIN to complete the payment
              </p>
            </div>
          </div>
        )}

        {/* Step 7: Payment Failed */}
        {step === "payment_failed" && (
          <div className="space-y-4 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-10 w-10 text-red-600" />
              </div>
              <p className="font-heading font-bold text-xl text-red-800">Payment Failed</p>
              <p className="text-sm text-red-600 mt-2">
                {paymentError || "Unable to process payment"}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setStep("payment")}
                className="w-full bg-gradient-to-r from-sky-cta to-sky-brand text-white hover:from-sky-cta/90 hover:to-sky-brand/90 font-bold tracking-wider rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Again
              </Button>
              <button
                onClick={() => setStep("mpesa_phone")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                ← Change phone number
              </button>
              <button
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Cancel Booking
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Need help?</span> Contact our support team for assistance with your payment.
              </p>
            </div>
          </div>
        )}

        {/* Step 8: Ticket */}
        {step === "ticket" && (
          <div className="mt-4">
            <div className="bg-gradient-to-br from-sky-brand via-sky-brand/90 to-sky-dark rounded-3xl overflow-hidden text-white shadow-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 font-medium">SKYWARD AIRLINES</p>
                    <p className="font-heading text-xl font-bold mt-1">BOARDING PASS</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs opacity-80 font-medium">FROM</p>
                    <p className="font-bold text-xl mt-1">{route.from}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <PlaneTakeoff className="h-6 w-6" />
                    </div>
                    <div className="w-full h-0.5 bg-white/30 my-2 rounded-full" />
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <Clock className="h-3 w-3" />
                      {flightTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80 font-medium">TO</p>
                    <p className="font-bold text-xl mt-1">{route.to}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/20 pt-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">PASSENGER</p>
                    <p className="font-semibold mt-1">{form.fullName}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">DATE</p>
                    <p className="font-semibold mt-1">{travelDate ? format(travelDate, "dd MMM yyyy") : "—"}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">TICKET REF</p>
                    <p className="font-semibold font-mono text-xs mt-1">{ticketRef}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">AMOUNT PAID</p>
                    <p className="font-semibold mt-1">{route.price}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">ID/PASSPORT</p>
                    <p className="font-semibold text-xs mt-1 truncate">{form.idNumber}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs opacity-80 font-medium">EMAIL</p>
                    <p className="font-semibold text-xs mt-1 break-all">{form.email}</p>
                  </div>
                </div>
              </div>
              <div className="border-t-2 border-dashed border-white/30 mx-6" />
              <div className="p-6 text-center text-xs opacity-80">
                <p className="flex items-center justify-center gap-2">
                  <span>✈️</span>
                  Please present this ticket at check-in. Safe travels!
                  <span>✈️</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleClose} 
                variant="outline" 
                className="flex-1 rounded-2xl py-4 border-2 hover:bg-muted/50 transition-all duration-300"
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-sky-cta to-sky-brand text-white hover:from-sky-cta/90 hover:to-sky-brand/90 rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex justify-center mt-4">
              <a
                href="https://wa.me/447446234805"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <img 
                  src="https://png.pngtree.com/png-clipart/20190516/original/pngtree-whatsapp-icon-png-image_3584844.jpg" 
                  alt="WhatsApp" 
                  className="h-5 w-5 rounded"
                />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
