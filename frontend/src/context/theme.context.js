import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { themes } from "./theme"; // ✅ Importamos los temas desde un archivo separado

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); // Detecta el tema del sistema
  const [theme, setTheme] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

