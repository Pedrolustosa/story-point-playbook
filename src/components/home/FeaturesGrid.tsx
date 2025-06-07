
import React from 'react';
import { Star, Clock, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Star,
      title: "Estimativas Precisas",
      description: "Use a sequência de Fibonacci para estimativas mais precisas e realistas"
    },
    {
      icon: Clock,
      title: "Tempo Real",
      description: "Colabore instantaneamente com sua equipe, onde quer que estejam"
    },
    {
      icon: Shield,
      title: "Votação Anônima",
      description: "Evite vieses com votações anônimas até a revelação final"
    },
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Configure uma sessão em segundos e comece a estimar imediatamente"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {features.map((feature, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-orange-100 rounded-xl mb-4 mx-auto">
              <feature.icon className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-gray-600">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
