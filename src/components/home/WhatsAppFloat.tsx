import { WhatsAppIcon } from "@/components/SocialIcon";

/**
 * Homepage-only floating WhatsApp chat button. Icon-only on phones, labelled on
 * larger screens. Hidden while the mobile menu is open (see globals.css), and
 * clear of the iPhone home indicator via the safe-area insets.
 */
export function WhatsAppFloat({ href, display }: { href: string; display: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with Siccotel on WhatsApp, ${display} (opens in a new tab)`}
      className="whatsapp-float fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex size-14 items-center justify-center gap-2.5 rounded-full bg-[#13854a] text-white shadow-[0_6px_20px_-6px_rgba(15,16,18,0.45)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#0f6e3d] hover:shadow-[0_10px_24px_-8px_rgba(15,16,18,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13854a] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:h-12 sm:w-auto sm:pr-5 sm:pl-4"
    >
      <WhatsAppIcon className="size-7 shrink-0 sm:size-6" />
      <span aria-hidden className="hidden text-[0.9375rem] font-semibold whitespace-nowrap sm:inline">
        Chat on WhatsApp
      </span>
    </a>
  );
}
