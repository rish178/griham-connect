import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

// The (site) route group carries the shared marketing chrome. Bespoke
// project pages under app/projects/[slug] sit outside this group so they can
// render full-bleed with their own header/footer — see that route's page.tsx.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
