
import React from 'react';
import { UserPlus, Vote, Eye, BarChart } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Criar Sala",
      description: "Crie uma sala de estimativa e convide sua equipe para participar",
      step: "01"
    },
    {
      icon: Vote,
      title: "Votar Anonimamente",
      description: "Cada membro vota de forma anônima usando a sequência de Fibonacci",
      step: "02"
    },
    {
      icon: Eye,
      title: "Revelar Votos",
      description: "Todos os votos são revelados simultaneamente para evitar viés",
      step: "03"
    },
    {
      icon: BarChart,
      title: "Analisar Resultados",
      description: "Discuta as diferenças e chegue a um consenso sobre a estimativa",
      step: "04"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Um processo simples e eficiente para estimativas mais precisas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {step.step}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
