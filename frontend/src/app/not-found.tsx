"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-white p-5 font-sans">
      <div className="container w-full  p-8 md:p-12  text-center">
        {/* Brand Logo */}
        <BrandLogo className="max-h-16 max-w-[180px] mx-auto object-contain mb-6" />

        {/* 404 Badge & Heading */}
        <h1 className="text-5xl font-black text-secondary leading-none mb-3 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track for your next journey.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-block px-8 py-3.5 bg-secondary hover:bg-primary text-white text-xs font-bold rounded-full tracking-wider uppercase transition-all duration-300 shadow-md hover:-translate-y-0.5"
        >
          Back to Home Page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
