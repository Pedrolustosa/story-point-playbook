
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Scrum Master",
      company: "TechCorp",
      content: "O Planning Poker transformou nossas cerimônias de estimativa. Agora temos estimativas muito mais precisas e discussões mais produtivas.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Product Owner",
      company: "InnovateLab",
      content: "Ferramenta indispensável para qualquer equipe ágil. A interface é intuitiva e o processo de votação anônima elimina completamente os vieses.",
      rating: 5,
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Tech Lead",
      company: "DevSolutions",
      content: "Implementamos na nossa equipe distribuída e os resultados foram imediatos. Recomendo para todas as equipes que trabalham com metodologias ágeis.",
      rating: 5,
      avatar: "AC"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que Dizem Nossos Usuários
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja como equipes estão melhorando suas estimativas com nossa plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-600 mb-4" />
                  <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
