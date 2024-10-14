// Settings Provider tsx

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SettingsContextType {
  geoColor: boolean;
  setGeoColor: React.Dispatch<React.SetStateAction<boolean>>;
  QGridColumns: number;
  setQGridColumns: React.Dispatch<React.SetStateAction<number>>;
}

// Create a context with default values
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Custom hook to use the DataContext
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

// Helper function to retrieve initial state from localStorage or defaults
// const getInitialGeoColor = () => {
//   const saved = localStorage.getItem('geoColor');
//   return saved !== null ? JSON.parse(saved) === true : true;
// };

// const getInitialQGridColumns = () => {
//   const saved = localStorage.getItem('QGridColumns');
//   return saved !== null ? Number(saved) : 8;
// };

// Create a provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geoColor, setGeoColor] = useState<boolean>(true);
  const [QGridColumns, setQGridColumns] = useState<number>(8);

  useEffect(() => {
    localStorage.setItem('geoColor', JSON.stringify(geoColor));
  }, [geoColor]);

  useEffect(() => {
    localStorage.setItem('QGridColumns', JSON.stringify(QGridColumns));
  }, [QGridColumns]);

  return (
    <SettingsContext.Provider
      value={{ geoColor, setGeoColor, QGridColumns, setQGridColumns }}>
      {children}
    </SettingsContext.Provider>
  );
};
