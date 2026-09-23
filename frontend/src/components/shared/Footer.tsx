"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { ArrowUpRight } from "lucide-react";
import BrandLogo from "../common/BrandLogo";
import HazardTape from "@/components/theme/HazardTape";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/companies", label: "Our Group Companies" },
  { href: "/projects", label: "Projects" },
  { href: "/careers", label: "Careers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact Us" },
];

const divisions = [
  { href: "/companies/hidensypro", label: "Hidensypro Sdn. Bhd. (Machinery)" },
  { href: "/companies/bm-magnitude-services", label: "BM Magnitude Services (Cleaning)" },
  { href: "/companies/cm-plantation-services", label: "CM Plantation Services (Plantation)" },
  { href: "/companies/am-multi-trade-empire", label: "AM Multi Trade Empire (Mini Market)" },
  { href: "/companies/ma-travel-and-tour", label: "MA Travel and Tour Sdn. Bhd. (Ticketing)" },
];

const Footer = () => {
  const settings = usePublicSettings();

  const socials = [
    { href: settings.facebookUrl, label: "Facebook", icon: FaFacebookF },
    { href: settings.linkedinUrl, label: "LinkedIn", icon: FaLinkedinIn },
    { href: settings.instagramUrl, label: "Instagram", icon: FaInstagram },
    { href: settings.twitterUrl, label: "Twitter / X", icon: FaTwitter },
    { href: settings.whatsappUrl, label: "WhatsApp", icon: FaWhatsapp },
  ].filter((item) => Boolean(item.href));

  return (
    <div className="bg-[var(--am-harbour)] text-white/70">
      <HazardTape height={6} />

      {/* Statement row */}
      <div className="container-am flex flex-col gap-8 border-b border-white/10 py-10 lg:flex-row lg:items-end lg:justify-between">
        <p className="font-display max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl">
          {settings.siteTagline || "One Group. Multiple Businesses."}
        </p>
        <Link
          href="/contact"
          className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-md bg-secondary px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--am-signal-deep)] lg:self-auto"
        >
          Start a conversation
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="container-am grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.1fr_1.1fr]">
        {/* Brand */}
        <div>
          <span className="inline-flex rounded-md bg-white px-4 py-3">
            <BrandLogo width={150} height={60} className="h-12 w-auto object-contain" />
          </span>
          <p className="mt-6 max-w-sm text-sm leading-7">{settings.siteDescription}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2.5">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-secondary hover:bg-secondary hover:text-white"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        <FooterColumn title="Quick Links">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Group Companies">
          {divisions.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Corporate Office">
          <li className="flex items-start gap-3">
            <MdLocationOn className="mt-0.5 shrink-0 text-secondary" size={18} />
            <span>
              <span className="font-semibold text-white">AM Management Group Sdn. Bhd.</span>
              <br />
              {settings.contactAddress}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <MdPhone className="shrink-0 text-secondary" size={18} />
            <a href={phoneHref(settings.contactPhone)} className="transition-colors hover:text-white">
              {settings.contactPhone}
            </a>
          </li>
          {settings.whatsappUrl && (
            <li className="flex items-center gap-3">
              <FaWhatsapp className="shrink-0 text-secondary" size={17} />
              <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                WhatsApp
              </a>
            </li>
          )}
          <li className="flex items-center gap-3">
            <MdEmail className="shrink-0 text-secondary" size={18} />
            <a href={`mailto:${settings.contactEmail}`} className="break-all transition-colors hover:text-white">
              {settings.contactEmail}
            </a>
          </li>
          {settings.contactEmailAlt && (
            <li className="flex items-center gap-3">
              <MdEmail className="shrink-0 text-secondary" size={18} />
              <a href={`mailto:${settings.contactEmailAlt}`} className="break-all transition-colors hover:text-white">
                {settings.contactEmailAlt}
              </a>
            </li>
          )}
          {settings.businessHours && (
            <li className="whitespace-pre-line border-t border-white/10 pt-4 text-xs leading-6">
              {settings.businessHours}
            </li>
          )}
        </FooterColumn>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/15">
        <div className="container-am flex flex-col items-center gap-3 py-5 text-center text-xs sm:text-sm md:flex-row md:justify-between md:text-left">
          <p>
            Copyright &copy; {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.
          </p>
          <p>
            Designed & Developed by{" "}
            <a
              href="https://iconicsoftltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline-offset-4 hover:text-secondary hover:underline"
            >
              Iconic Soft Ltd.
            </a>
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 text-sm font-bold text-white">{title}</h3>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  );
}

export default Footer;
