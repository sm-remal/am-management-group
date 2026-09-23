import About from "@/components/About/About";

import React from "react";

export const metadata = { title: "About Us" };

const page = () => {
  return (
    <div className="min-h-screen bg-white">
      <About></About>
    </div>
  );
};

export default page;
