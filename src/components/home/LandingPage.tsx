
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
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
          <div className="container mx-auto px-4 py-16">
            <HeroSection />
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
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
        <StatsSection />
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
      </main>
      
      <LandingFooter />
    </div>
  );
};
