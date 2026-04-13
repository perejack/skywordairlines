import { useState } from "react";
import { MessageCircle, X, Phone } from "lucide-react";
import crewAvatar from "@/assets/crew-avatar.png";

export function TalkToUs() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 bg-card rounded-2xl shadow-2xl border border-border p-5 w-72 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-heading font-bold text-foreground text-lg">Hey there!</p>
          <p className="text-muted-foreground text-sm mt-1">How can I help you?</p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://wa.me/447446234805"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-green-600 text-sky-brand-foreground px-4 py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+447446234805"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <Phone className="h-4 w-4" />
              +44 7446 234805
            </a>
            <a
              href="mailto:support@skywardairlines.com"
              className="flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Send us an Email
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-0 transition-all duration-300"
        aria-label="Talk to us"
      >
        {!open && (
          <div className="bg-card shadow-lg rounded-l-full rounded-r-none px-4 sm:px-5 py-2.5 sm:py-3 mr-[-8px] border border-r-0 border-border">
            <p className="font-heading font-bold text-foreground text-xs sm:text-sm whitespace-nowrap">Hey there!</p>
            <p className="text-muted-foreground text-[10px] sm:text-xs">How can I help you?</p>
          </div>
        )}
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-[3px] ring-sky-cta shadow-xl shrink-0">
          <img
            src={crewAvatar}
            alt="Customer support"
            className="w-full h-full object-cover"
            width={64}
            height={64}
          />
        </div>
      </button>
    </div>
  );
}
