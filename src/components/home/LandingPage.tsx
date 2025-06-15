
import React from 'react';
import { Navbar } from './Navbar';
import { LandingFooter } from './LandingFooter';
import { LandingHeroSection } from './sections/LandingHeroSection';
import { LandingFeaturesSection } from './sections/LandingFeaturesSection';
import { LandingStatsSection } from './sections/LandingStatsSection';
import { LandingHowItWorksSection } from './sections/LandingHowItWorksSection';
import { LandingTestimonialsSection } from './sections/LandingTestimonialsSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-white scroll-smooth">
      <Navbar />
      <main className="flex-1">
        <LandingHeroSection />
        <LandingFeaturesSection />
        <LandingStatsSection />
        <LandingHowItWorksSection />
        <LandingTestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  );
};
