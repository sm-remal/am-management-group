"use client";

import { FiPhone, FiMail } from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const TopNavbar = () => {
  const settings = usePublicSettings();

  return (
    <div className="hidden bg-[var(--am-harbour)] text-[13px] text-white/75 md:block">
      <div className="container-am">
        <div className="flex h-10 items-center justify-between gap-4">
          {/* Left Side - Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <a
              href={phoneHref(settings.contactPhone)}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <FiPhone size={14} className="text-secondary" />
              <span>{settings.contactPhone}</span>
            </a>

            <span aria-hidden="true" className="hidden h-3.5 w-px bg-white/20 sm:inline-block" />

            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <FiMail size={14} className="text-secondary" />
              <span>{settings.contactEmail}</span>
            </a>
          </div>

          {/* Right Side - Social Icons */}
          <div className="flex items-center gap-4">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
                aria-label="Facebook"
              >
                <FaFacebookF size={13} />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={13} />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
                aria-label="Instagram"
              >
                <FaInstagram size={13} />
              </a>
            )}
            {settings.twitterUrl && (
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
                aria-label="Twitter / X"
              >
                <FaTwitter size={13} />
              </a>
            )}
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
