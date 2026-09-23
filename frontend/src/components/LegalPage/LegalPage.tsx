"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import { usePublicSettings } from "@/features/settings/usePublicSettings";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const privacySections: LegalSection[] = [
  {
    title: "1. Information We Collect",
    paragraphs: [
      "We may collect information you provide when you contact us, submit an inquiry, apply for an opportunity, create an account, or otherwise use our website. This may include your name, email address, phone number, company details and the content of your message.",
      "We may also collect technical information such as your browser type, device information, approximate location, IP address and pages visited to keep the website secure and improve its performance.",
    ],
  },
  {
    title: "2. How We Use Information",
    paragraphs: [
      "We use information to respond to inquiries, provide requested services, process applications, communicate with you, maintain our website and improve our products and operations.",
      "We may also use information to protect our users and business, prevent misuse, comply with legal obligations and maintain appropriate business records.",
    ],
  },
  {
    title: "3. Sharing of Information",
    paragraphs: [
      "We do not sell personal information. We may share information with trusted service providers who support our website, communications, hosting, security or business operations, subject to appropriate confidentiality obligations.",
      "Information may also be disclosed where required by law, legal process, regulatory request or where necessary to protect the rights, safety or property of our company, users or others.",
    ],
  },
  {
    title: "4. Cookies and Similar Technologies",
    paragraphs: [
      "Our website may use cookies and similar technologies to remember preferences, understand website usage and support essential functionality. You can manage cookies through your browser settings, although some features may not work as intended if cookies are disabled.",
    ],
  },
  {
    title: "5. Data Security and Retention",
    paragraphs: [
      "We use reasonable administrative, technical and organisational measures to protect information against unauthorised access, loss, misuse or alteration. No internet transmission or storage system can be guaranteed to be completely secure.",
      "We retain information only for as long as reasonably necessary for the purposes described in this policy, to meet legal requirements, resolve disputes and enforce agreements.",
    ],
  },
  {
    title: "6. Your Choices and Rights",
    paragraphs: [
      "Depending on applicable law, you may have the right to request access to, correction of or deletion of personal information we hold about you. You may also ask us to stop certain communications or processing where permitted.",
      "To make a request, contact us using the details below. We may need to verify your identity before completing a request.",
    ],
  },
  {
    title: "7. Third-Party Websites",
    paragraphs: [
      "Our website may contain links to third-party websites or services. We are not responsible for the privacy practices, content or security of those third parties. Please review their policies before providing information.",
    ],
  },
  {
    title: "8. Policy Updates",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our operations, services or legal requirements. The revised policy will be posted on this page with an updated date.",
    ],
  },
];

const termsSections: LegalSection[] = [
  {
    title: "1. Acceptance of These Terms",
    paragraphs: [
      "By accessing or using this website, you agree to these Terms & Conditions and any applicable policies referenced here. If you do not agree, please do not use the website.",
    ],
  },
  {
    title: "2. Website Use",
    paragraphs: [
      "You may use this website only for lawful purposes and in a way that does not damage, disable, overburden or interfere with the website or another person's use of it.",
    ],
    items: [
      "Do not attempt to gain unauthorised access to the website, systems or accounts.",
      "Do not upload or transmit malicious code, misleading content or material that violates another person's rights.",
      "Do not use information from the website for unlawful, deceptive or unauthorised commercial purposes.",
    ],
  },
  {
    title: "3. Website Content",
    paragraphs: [
      "We aim to keep website content accurate and current, but information is provided for general information only. Content may change without notice and may not always reflect the latest availability, capability, pricing, timeline or business condition.",
      "Submitting an inquiry or application through the website does not create a contract, partnership, employment relationship or binding commitment unless confirmed separately in writing.",
    ],
  },
  {
    title: "4. Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, the website and its content, including text, names, logos, graphics, images, design and software, are owned by or licensed to AM Management Group and are protected by applicable intellectual property laws.",
      "You may view and print reasonable extracts for personal or internal reference. You must not reproduce, modify, distribute, publish or commercially exploit content without prior written permission.",
    ],
  },
  {
    title: "5. User Submissions",
    paragraphs: [
      "When you send information through a form or other website feature, you confirm that it is accurate, lawful and that you have the right to provide it. You remain responsible for the content you submit.",
      "You agree that we may use submitted information to respond to your request, provide relevant services and carry out our legitimate business activities in accordance with our Privacy Policy.",
    ],
  },
  {
    title: "6. Third-Party Links and Services",
    paragraphs: [
      "Links to third-party websites are provided for convenience. We do not endorse or control third-party content, availability, products or services and are not responsible for any loss arising from your use of them.",
    ],
  },
  {
    title: "7. Disclaimer and Liability",
    paragraphs: [
      "To the fullest extent permitted by law, the website and its content are provided without warranties of any kind, whether express or implied. We do not guarantee that the website will always be available, secure, complete or free from errors.",
      "Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited. Subject to that, we are not liable for indirect, incidental or consequential loss arising from your use of or reliance on the website.",
    ],
  },
  {
    title: "8. Changes and Governing Terms",
    paragraphs: [
      "We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted means you accept the updated terms. These terms are governed by the laws applicable in Malaysia, unless mandatory law requires otherwise.",
    ],
  },
];

export default function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const settings = usePublicSettings();
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? privacySections : termsSections;
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions";
  const intro = isPrivacy
    ? "How we collect, use and protect information when you interact with our website."
    : "The terms that apply when you access and use the AM Management Group website.";

  return (
    <div>
      <AboutBanner title={title} description={intro} />

      <div className="container  mx-auto px-4  md:px-6 bg-white ">
        <div>
          <article className=" bg-white  py-8   sm:py-10  lg:py-12">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-secondary">
                  {settings.siteName}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  {title}
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Last updated: 12 September 2026
              </p>
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8 text-slate-600">
              This document explains the terms and practices that apply to your
              use of {settings.siteName}. Please read it carefully. If you have
              questions about this page, contact our team before using the
              website.
            </p>

            <div className="mt-10 space-y-9">
              {sections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
                    {section.title}
                  </h3>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-sm leading-7 text-slate-600 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 sm:text-base">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  Questions about this document?
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Our team is available to help with privacy or website
                  enquiries.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
              >
                <Mail className="size-4" /> Contact us
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
