
import React from "react";

export const FormHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs text-muted-foreground mt-1">{children}</div>
);
