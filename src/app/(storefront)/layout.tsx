import { SmoothScroll } from "@/components/SmoothScroll";
import { Navigation } from "@/components/Navigation";
import { CookieConsent } from "@/components/CookieConsent";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />
      <Navigation />
      <CookieConsent />
      <SmoothScroll>
        <main className="flex-1">
          {children}
        </main>
      </SmoothScroll>
    </>
  );
}
