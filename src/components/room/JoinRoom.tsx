
import React from "react";
import { JoinRoomHeader } from "./JoinRoomHeader";
import { JoinRoomForm } from "./JoinRoomForm";
import { Card } from "../ui/card";

export const JoinRoom: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50 flex items-center justify-center">
      <div className="container max-w-md mx-auto px-2 py-8 flex flex-1 items-center justify-center">
        <Card className="w-full shadow-2xl border-0 bg-white animate-fade-in" tabIndex={-1}>
          <JoinRoomHeader />
          <JoinRoomForm />
        </Card>
      </div>
    </div>
  );
};
