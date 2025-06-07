
import React from 'react';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: TrendingUp,
      number: "95%",
      label: "Precisão nas Estimativas",
      description: "Melhore a precisão das suas estimativas com metodologia comprovada"
    },
    {
      icon: Users,
      number: "10K+",
      label: "Equipes Ativas",
      description: "Milhares de equipes já confiam na nossa plataforma"
    },
    {
      icon: Clock,
      number: "60%",
      label: "Tempo Economizado",
      description: "Reduza drasticamente o tempo gasto em reuniões de estimativa"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Avaliação dos Usuários",
      description: "Nota média baseada em centenas de avaliações"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resultados que Falam por Si
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja como nossa plataforma está transformando a forma como equipes estimam projetos
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
