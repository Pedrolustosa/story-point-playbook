
import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesGrid } from './FeaturesGrid';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <HeroSection />
        <FeaturesGrid />
        <LandingFooter />
      </div>
    </div>
  );
};
