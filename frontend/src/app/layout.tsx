import type { Metadata } from "next";
import { Archivo, Sora } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/shared/SiteChrome";
import {
  defaultPublicSettings,
  fetchPublicSettings,
} from "@/features/settings/public-settings";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

// Display face for headings: geometric, refined, reads well at small sizes.
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-sora",
});

export const generateMetadata = async (): Promise<Metadata> => {
  try {
    const settings = await fetchPublicSettings({ cache: "no-store" });

    return {
      title: {
        default: settings.seoTitle,
        template: `%s | ${settings.siteName}`,
      },
      description: settings.seoDescription,
      openGraph: {
        title: settings.seoTitle,
        description: settings.seoDescription,
        siteName: settings.siteName,
        type: "website",
      },
    };
  } catch {
    return {
      title: defaultPublicSettings.seoTitle,
      description: defaultPublicSettings.seoDescription,
    };
  }
};

export const viewport = {
  themeColor: "#0f2447",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${sora.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
