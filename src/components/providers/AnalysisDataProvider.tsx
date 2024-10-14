// Analysis Data Provider tsx

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DataFrame } from 'danfojs';

interface AnalysisDataContextType {
  allData: DataFrame | null;
  setAllData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  aioData: DataFrame | null;
  setAioData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  aioHeadings: string[] | null;
  setAioHeadings: React.Dispatch<React.SetStateAction<string[] | null>>;
  compData: DataFrame | null;
  setCompData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  metadataData: DataFrame | null;
  setMetadataData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  metadataAll: DataFrame | null;
  setMetadataAll: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  salesData: DataFrame | null;
  setSalesData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  surveyData: DataFrame | null;
  setSurveyData: React.Dispatch<React.SetStateAction<DataFrame | null>>;
  surveyNameFirestore: string | null;
  setSurveyNameFirestore: React.Dispatch<React.SetStateAction<string | null>>;
  dfOutputs: DataFrame[] | null;
  setDfOutputs: React.Dispatch<React.SetStateAction<DataFrame[] | null>>;
  errors: { [key: string]: string[] };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
}

// Create a context with default values
const AnalysisDataContext = createContext<AnalysisDataContextType | undefined>(undefined);

// Custom hook to use the DataContext
export const useAnalysisDataContext = () => {
  const context = useContext(AnalysisDataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Create a provider component
export const AnalysisDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allData, setAllData] = useState<DataFrame | null>(null);
  const [aioData, setAioData] = useState<DataFrame | null>(null);
  const [aioHeadings, setAioHeadings] = useState<string[] | null>(null);
  const [compData, setCompData] = useState<DataFrame | null>(null);
  const [metadataData, setMetadataData] = useState<DataFrame | null>(null);
  const [metadataAll, setMetadataAll] = useState<DataFrame | null>(null);
  const [salesData, setSalesData] = useState<DataFrame | null>(null);
  const [surveyData, setSurveyData] = useState<DataFrame | null>(null);
  const [surveyNameFirestore, setSurveyNameFirestore] = useState<string | null>(null);
  const [dfOutputs, setDfOutputs] = useState<DataFrame[] | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


  return (
    <AnalysisDataContext.Provider
      value={{
        allData, setAllData,
        aioData, setAioData, aioHeadings, setAioHeadings, compData, setCompData, metadataData, setMetadataData, metadataAll, setMetadataAll,
        salesData, setSalesData,
        surveyData, setSurveyData, surveyNameFirestore, setSurveyNameFirestore,
        dfOutputs, setDfOutputs, errors, setErrors
      }}>
      {children}
    </AnalysisDataContext.Provider>
  );
};


