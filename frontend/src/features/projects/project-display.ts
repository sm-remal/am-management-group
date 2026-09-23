import type { BusinessCategory } from "@/features/companies/company.types";
import type { ProjectRecord, ProjectStatus } from "./project.types";

export const projectFallbackImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop";

export const projectCategoryLabels: Array<{ value: BusinessCategory; label: string }> = [
  { value: "MANAGEMENT_INVESTMENT", label: "Management & Investment" },
  { value: "CLEANING_SERVICES", label: "Cleaning Services" },
  { value: "ENGINEERING_MACHINERY", label: "Engineering & Machinery" },
  { value: "PLANTATION_AGRICULTURE", label: "Plantation & Agriculture" },
  { value: "RETAIL_TRADING", label: "Retail & Trading" },
  { value: "TRAVEL_TOURISM", label: "Travel & Tourism" },
];

export const projectStatusLabels: Array<{ value: ProjectStatus; label: string }> = [
  { value: "COMPLETED", label: "Completed" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "UPCOMING", label: "Upcoming" },
];

export const getProjectCategoryLabel = (value: BusinessCategory) => {
  return projectCategoryLabels.find((category) => category.value === value)?.label ?? value;
};

export const getProjectStatusLabel = (value: ProjectStatus) => {
  return projectStatusLabels.find((status) => status.value === value)?.label ?? value;
};

export const getProjectImage = (project: ProjectRecord) => {
  return (
    project.coverImage ||
    project.images.find((image) => Boolean(image.imageUrl))?.imageUrl ||
    projectFallbackImage
  );
};

export const isLikelyDirectImageUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return true;
  // Site-hosted images (frontend/public/images/...) are valid too
  if (trimmedValue.startsWith("/")) return /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(trimmedValue);

  try {
    const url = new URL(trimmedValue);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (hostname === "images.unsplash.com" || hostname.endsWith(".pinimg.com")) return true;

    return /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(pathname);
  } catch {
    return false;
  }
};

export const getProjectGallery = (project: ProjectRecord) => {
  const imageUrls = project.images.map((image) => image.imageUrl).filter(Boolean);
  const coverImage = project.coverImage ? [project.coverImage] : [];
  return Array.from(new Set([...coverImage, ...imageUrls]));
};

export const getProjectTimeline = (project: ProjectRecord) => {
  const startYear = project.startDate ? new Date(project.startDate).getFullYear() : null;
  const endYear = project.endDate ? new Date(project.endDate).getFullYear() : null;

  if (startYear && endYear && startYear !== endYear) return `${startYear} - ${endYear}`;
  if (startYear) return String(startYear);
  if (endYear) return String(endYear);
  return "Not set";
};

export const splitProjectScope = (scope: string | null) => {
  if (!scope) return [];

  return scope
    .split(/\r?\n|,/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
};

export const splitProjectHighlights = (highlights: string | null) => {
  if (!highlights) return [];

  return highlights
    .split(/\r?\n|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
};
