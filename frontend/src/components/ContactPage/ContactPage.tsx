"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import InquiryFormCard from "@/components/contact/InquiryFormCard";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default function ContactPage() {
  const settings = usePublicSettings();

  const defaultBusinessHours =
    "Monday - Friday: 8:30 AM - 5:30 PM\nSaturday: 8:30 AM - 1:00 PM";
  const businessHoursText = settings.businessHours || defaultBusinessHours;

  const contactItems = [
    {
      icon: MapPin,
      label: "Address",
      value: (
        <>
          {settings.siteName} Sdn. Bhd.
          {settings.contactAddress && (
            <>
              <br />
              {settings.contactAddress}
            </>
          )}
        </>
      ),
    },
    {
      icon: Phone,
      label: "Phone",
      value: (
        <a href={phoneHref(settings.contactPhone)} className="hover:underline">
          {settings.contactPhone}
        </a>
      ),
    },
    ...(settings.whatsappUrl
      ? [
          {
            icon: FaWhatsapp,
            label: "WhatsApp",
            value: (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Chat with us on WhatsApp
              </a>
            ),
          },
        ]
      : []),
    {
      icon: Mail,
      label: "Email",
      value: (
        <>
        <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
          {settings.contactEmail}
        </a>
        {settings.contactEmailAlt && (
          <>
            <br />
            <a href={`mailto:${settings.contactEmailAlt}`} className="hover:underline">
              {settings.contactEmailAlt}
            </a>
          </>
        )}
        </>
      ),
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: <span className="whitespace-pre-line">{businessHoursText}</span>,
    },
  ];

  const socialLinks = [
    { label: "Facebook", href: settings.facebookUrl, icon: FaFacebookF },
    { label: "LinkedIn", href: settings.linkedinUrl, icon: FaLinkedinIn },
    { label: "Instagram", href: settings.instagramUrl, icon: FaInstagram },
    { label: "Twitter / X", href: settings.twitterUrl, icon: FaTwitter },
  ].filter((link) => link.href);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-5">
            <div className="space-y-6">
              <h2 className="border-b border-slate-100 pb-3 text-2xl font-bold text-slate-900">
                Corporate HQ
              </h2>

              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="shrink-0 rounded-lg bg-secondary/10 p-3 text-secondary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-slate-500">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {socialLinks.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-3 text-xs font-semibold uppercase text-slate-500">
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((platform) => (
                    <a
                      key={platform.label}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
                    >
                      <platform.icon aria-hidden="true" size={14} />
                      {platform.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <InquiryFormCard successCompanyName={settings.siteName} />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative h-100 w-full overflow-hidden rounded-xl">
            <iframe
              title={`${settings.siteName} HQ Location`}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15942.274191024314!2d102.278!3d2.272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1f1f28b78811d%3A0x6b4e60bb0cb2243a!2sAyer%20Keroh%2C%20Malacca%2C%20Malaysia!5e0!3m2!1sen!2smy!4v1700000000000!5m2!1sen!2smy"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
