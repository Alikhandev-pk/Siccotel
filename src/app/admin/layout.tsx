import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Siccotel admin" },
  robots: { index: false, follow: false, nocache: true },
};

/** The marker hides the public header and footer (see globals.css). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div data-admin-shell="" className="min-h-dvh bg-[#f6f6f4] text-ink">
      {children}
    </div>
  );
}
