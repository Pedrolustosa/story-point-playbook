
import React from "react";
import { useLocation } from "react-router-dom";

export const NotFoundCard: React.FC = () => {
  const location = useLocation();
  return (
    <div className="text-center bg-white bg-opacity-80 px-8 py-14 rounded-lg shadow-lg max-w-md mx-auto border border-gray-200">
      <h1 className="text-6xl font-extrabold text-orange-600 animate-pulse mb-2">404</h1>
      <p className="text-xl text-gray-700 mb-4 font-semibold">Oops! Página não encontrada</p>
      <p className="text-gray-500 mb-6">
        O endereço <span className="font-mono bg-gray-100 px-2 rounded text-sm">{location.pathname}</span> não existe.
      </p>
      <a href="/" className="inline-block px-5 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white font-bold rounded-lg shadow hover:from-green-600 hover:to-orange-600 hover:scale-105 transition-transform duration-150">
        Voltar ao início
      </a>
    </div>
  );
};
