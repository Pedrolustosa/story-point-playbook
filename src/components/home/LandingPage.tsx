
import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesGrid } from './FeaturesGrid';
import { StatsSection } from './StatsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TestimonialsSection } from './TestimonialsSection';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Navbar sempre sticky */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 animate-fade-in bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
          <div className="container mx-auto max-w-5xl px-4 py-16 lg:py-24">
            <HeroSection />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white animate-fade-in">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recursos Poderosos
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para estimativas ágeis eficientes
              </p>
            </div>
            <FeaturesGrid />
          </div>
        </section>
        
        {/* Stats Section */}
        <div className="bg-amber-50">
          <StatsSection />
        </div>

        {/* How It Works Section */}
        <div className="bg-white">
          <HowItWorksSection />
        </div>
        
        {/* Testimonials Section */}
        <section className="bg-gradient-to-tl from-orange-50 via-white to-green-50 py-16 animate-fade-in">
          <TestimonialsSection />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
