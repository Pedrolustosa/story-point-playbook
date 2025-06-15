
import React from "react";
import { Users } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "../ui/card";

export const JoinRoomHeader: React.FC = () => (
  <CardHeader className="text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-orange-600 rounded-2xl mb-2 mx-auto shadow-lg animate-fade-in">
      <Users className="w-8 h-8 text-white" />
    </div>
    <CardTitle className="text-xl font-bold text-gray-900">
      Entrar em Sala
    </CardTitle>
    <CardDescription className="text-gray-600">
      Junte-se a uma sessão existente
    </CardDescription>
  </CardHeader>
);
