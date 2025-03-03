import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { themes } from "./theme"; // Importamos los temas desde un archivo separado

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); // Detecta el tema del sistema
  const [mode, setMode] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Combinamos el objeto del tema con la propiedad 'mode'
  const theme = { ...themes[mode], mode };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
