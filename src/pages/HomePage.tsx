import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RoadmapSection from '../components/RoadmapSection';

const HomePage = () => {
  return (
    <div className="relative z-10">
      <HeroSection />
      <FeaturesSection />
      <RoadmapSection />
    </div>
  );
};

export default HomePage;