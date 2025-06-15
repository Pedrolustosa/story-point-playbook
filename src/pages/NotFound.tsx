
import { useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import { NotFoundCard } from "../components/notfound/NotFoundCard";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 animate-fade-in">
      <NotFoundCard />
    </div>
  );
};

export default NotFound;
