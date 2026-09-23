import React from "react";
import AboutBanner from "./AboutBanner/AboutBanner";
import AboutContent from "./AboutContent";

const About = () => {
  return (
    <div>
      <AboutBanner
        title="About AM Management Group"
        description="A Malaysian-based company with more than a decade of experience, delivering construction, property development and related business solutions with a strong commitment to quality, reliability and sustainable growth."
      />

      <AboutContent />
    </div>
  );
};

export default About;
