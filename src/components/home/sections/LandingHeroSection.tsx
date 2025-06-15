
import React from 'react';
import { HeroSection } from '../HeroSection';

export const LandingHeroSection: React.FC = () => (
  <section className="relative pt-20 pb-16 animate-fade-in bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
    <div className="container mx-auto max-w-5xl px-4 py-16 lg:py-24">
      <HeroSection />
    </div>
  </section>
);
