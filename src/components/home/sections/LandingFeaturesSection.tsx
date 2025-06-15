
import React from 'react';
import { FeaturesGrid } from '../FeaturesGrid';

export const LandingFeaturesSection: React.FC = () => (
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
);
