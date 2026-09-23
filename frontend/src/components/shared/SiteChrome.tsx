"use client";

import { usePathname } from "next/navigation";
import AuthSessionWatcher from "@/components/Auth/AuthSessionWatcher";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import ScrollToTopButton from "@/components/shared/ScrollToTopButton";
import TopNavbar from "@/components/shared/TopNavbar";
import ScrollReveal from "@/components/theme/ScrollReveal";

type SiteChromeProps = {
  children: React.ReactNode;
};

const SiteChrome = ({ children }: SiteChromeProps) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && (
        <header className="sticky top-0 z-50">
          <TopNavbar />
          <Navbar />
        </header>
      )}

      <main className="flex-1">{children}</main>

      {!isDashboard && (
        <>
          <footer>
            <Footer />
          </footer>
          <ScrollToTopButton />
        </>
      )}

      {!isDashboard && <ScrollReveal />}
      <AuthSessionWatcher />
    </>
  );
};

export default SiteChrome;
