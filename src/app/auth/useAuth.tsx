import { useContext } from "react";

import { AuthContext } from "./AuthProvider";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth kann nur innerhalb von AuthProvider aufgerufen werden."
    );
  }
  return context;
};
