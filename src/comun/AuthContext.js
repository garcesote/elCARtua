import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState('');

  return (
    <AuthContext.Provider value={{ isLogged, setIsLogged, userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};