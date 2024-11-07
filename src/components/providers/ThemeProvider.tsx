// Theme Provider tsx

"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkTheme: boolean;
  setIsDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
}

// Create a context with default values
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

// Interface for the ThemeProvider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  const toggleTheme = (): void => {
    setIsDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      localStorage.setItem("isDarkTheme", JSON.stringify(newTheme));
      return newTheme;
    });
  };

  useEffect(() => {
    const storedThemePreference = localStorage.getItem("isDarkTheme");
    if (storedThemePreference !== null) {
      setIsDarkTheme(JSON.parse(storedThemePreference));
    } else {
      setIsDarkTheme(false); // Default to light theme if nothing is stored
      localStorage.setItem("isDarkTheme", JSON.stringify(false));
    }
  }, []);

  // Effect to apply dark theme class to document
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);


  return (
    <ThemeContext.Provider
      value={{ isDarkTheme, setIsDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
