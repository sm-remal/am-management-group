import { env } from "@/config/env";
import type { SettingListResponse, SettingRecord } from "./setting.types";

export type PublicSettings = {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  businessHours: string;
  websiteLogo: string;
  heroBannersDesktop: string[];
  heroBannersMobile: string[];
  seoTitle: string;
  seoDescription: string;
  contactPhone: string;
  whatsappUrl: string;
  contactEmail: string;
  /** Second address shown next to the primary one (key: contact.email_alt). */
  contactEmailAlt: string;
  contactAddress: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
};

export const defaultPublicSettings: PublicSettings = {
  siteName: "AM Management Group",
  siteTagline: "One Group. Multiple Businesses.",
  siteDescription:
    "AM Management Group - Empowering growth through diversified operations in construction, engineering, plantation, retail, and travel services.",
  businessHours: "Monday - Friday: 8:30 AM - 5:30 PM\nSaturday: 8:30 AM - 1:00 PM",
  websiteLogo: "",
  heroBannersDesktop: [],
  heroBannersMobile: [],
  seoTitle: "AM Management Group",
  seoDescription:
    "Malaysian business group established in 2012. CIDB Grade G5 contractor with companies in machinery, cleaning services, plantation, mini market retail and travel ticketing.",
  contactPhone: "+60 16-860 0084",
  whatsappUrl: "https://wa.me/60168600084",
  contactEmail: "info@ammanagement.com.my",
  contactEmailAlt: "ammanagement2012@gmail.com",
  contactAddress:
    "No 387-O/1 (1st Floor), Jalan Melor Utama, Taman Peringgit Jaya, 75400 Melaka, Malaysia",
  facebookUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  twitterUrl: "",
};

const normalizeSettingValue = (value?: string) => {
  const trimmedValue = value?.trim() ?? "";
  const markdownLinkMatch = trimmedValue.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

  return markdownLinkMatch?.[2]?.trim() || trimmedValue;
};

const normalizeWhatsAppNumber = (value?: string) =>
  normalizeSettingValue(value).replace(/\D/g, "");

const buildWhatsAppUrl = (value?: string) => {
  const number = normalizeWhatsAppNumber(value);
  return number ? `https://wa.me/${number}` : "";
};

const toSettingsMap = (settings: SettingRecord[]) =>
  settings.reduce<Record<string, string>>((settingsMap, setting) => {
    settingsMap[setting.key] = normalizeSettingValue(setting.value);
    return settingsMap;
  }, {});

export const mapPublicSettings = (
  settings: SettingRecord[],
): PublicSettings => {
  const settingsMap = toSettingsMap(settings);
  const siteName = settingsMap["site.name"] || defaultPublicSettings.siteName;
  const siteDescription =
    settingsMap["site.description"] || defaultPublicSettings.siteDescription;

  return {
    siteName,
    siteTagline:
      settingsMap["site.tagline"] || defaultPublicSettings.siteTagline,
    siteDescription,
    businessHours:
      settingsMap["site.business_hours"] || defaultPublicSettings.businessHours,
    websiteLogo:
      settingsMap["site.website_logo"] || defaultPublicSettings.websiteLogo,
    heroBannersDesktop: (
      settingsMap["site.hero_banner_desktop"] ||
      settingsMap["site.hero_banner"] ||
      settingsMap["site.heru_banner"] ||
      ""
    )
      .split(",")
      .map((banner) => banner.trim())
      .filter(Boolean),
    heroBannersMobile: (settingsMap["site.hero_banner_mobile"] || "")
      .split(",")
      .map((banner) => banner.trim())
      .filter(Boolean),
    seoTitle: settingsMap["seo.title"] || siteName,
    seoDescription: settingsMap["seo.description"] || siteDescription,
    contactPhone:
      settingsMap["contact.phone"] || defaultPublicSettings.contactPhone,
    whatsappUrl:
      buildWhatsAppUrl(settingsMap["contact.whatsapp"]) ||
      defaultPublicSettings.whatsappUrl,
    contactEmail:
      settingsMap["contact.email"] || defaultPublicSettings.contactEmail,
    contactEmailAlt:
      settingsMap["contact.email_alt"] ?? defaultPublicSettings.contactEmailAlt,
    contactAddress:
      settingsMap["contact.address"] || defaultPublicSettings.contactAddress,
    facebookUrl:
      settingsMap["social.facebook"] || defaultPublicSettings.facebookUrl,
    linkedinUrl:
      settingsMap["social.linkedin"] || defaultPublicSettings.linkedinUrl,
    instagramUrl:
      settingsMap["social.instagram"] || defaultPublicSettings.instagramUrl,
    twitterUrl:
      settingsMap["social.twitter"] || defaultPublicSettings.twitterUrl,
  };
};

export const fetchPublicSettings = async (
  init?: RequestInit,
): Promise<PublicSettings> => {
  const response = await fetch(`${env.apiBaseUrl}/settings`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public settings");
  }

  const result = (await response.json()) as {
    success: boolean;
    data?: SettingListResponse;
  };

  return mapPublicSettings(result.data?.settings ?? []);
};
