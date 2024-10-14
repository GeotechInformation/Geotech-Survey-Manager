// Survey Data Provider tsx

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useNotification } from './NotificationProvider';
import { getCollectionQuestions, saveCollectionInDB } from '@/services';
import { Question } from '@/types/Question';
import { CollectionMetadata } from '@/types/CollectionMetadata';

interface SurveyDataContextType {
  collection: Question[] | null;
  setCollection: React.Dispatch<React.SetStateAction<Question[] | null>>;
  collectionMaster: Question[] | null;
  setCollectionMaster: React.Dispatch<React.SetStateAction<Question[] | null>>;
  // Collection Metadata
  collectionMetadata: CollectionMetadata | null;
  setCollectionMetadata: React.Dispatch<React.SetStateAction<CollectionMetadata | null>>;
  // Unsaved Changes for tracking saved state
  unsavedChanges: boolean;
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;

  createTemplateSurvey: (surveyName: string, surveyType: string) => void;
  saveCollection: () => void;
  deleteAllData: () => void;
}

// Create a context with default values
const SurveyDataContext = createContext<SurveyDataContextType | undefined>(undefined);

// Custom hook to use the SurveyDataContext
export const useSurveyDataContext = (): SurveyDataContextType => {
  const context = useContext(SurveyDataContext);
  if (context === undefined) {
    throw new Error('useSurveyDataContext must be used within a SurveyDataProvider');
  }
  return context;
};

// Create a provider component
export const SurveyDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const [collection, setCollection] = useState<Question[] | null>(null);
  const [collectionMaster, setCollectionMaster] = useState<Question[] | null>(null);
  const [collectionMetadata, setCollectionMetadata] = useState<CollectionMetadata | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);


  useEffect(() => {
    if (!addNotification) return;
    const getMasterQuestions = async () => {
      try {
        const response = await getCollectionQuestions('MasterSurveyCollection');
        if ('success' in response) {
          if (!response.success) {
            addNotification(response.message!, 'error');
            return;
          }
        }
        if (Array.isArray(response)) {
          setCollectionMaster(response);
        }
      } catch (error) {
        addNotification('An Error Occurred. Please refresh', 'error');
        console.error(error)
      }
    }

    getMasterQuestions();
  }, [addNotification, getCollectionQuestions])


  /**
   * Create Template Survey
   * @param surveyName 
   * @param surveyType 
   * @returns 
   */
  const createTemplateSurvey = (surveyName: string, surveyType: string) => {
    if (!collectionMaster) {
      addNotification("Collection Master is not initliased", "error");
      return;
    }
    const metadata: CollectionMetadata = {
      name: surveyName,
      createdAt: Timestamp.now(),
      lastSaved: Timestamp.now()
    }
    setCollectionMetadata(metadata)
    setUnsavedChanges(true);

    if (surveyType === "all") {
      setCollection(collectionMaster);
    } else {
      const filteredCollection = collectionMaster.filter((item) => {
        return item.surveyType?.[surveyType as keyof Question["surveyType"]] === true;
      });
      setCollection(filteredCollection);
    }
  }

  /**
   * Save Collection
   * @returns 
   */
  const saveCollection = async () => {
    if (!collection || collection.length <= 0 || !collectionMetadata || !collectionMetadata.name) {
      console.error("User tried to save a collection when its not loaded. Error in 'Save Collection'");
      addNotification("Error Saving Survey", 'error');
      return;
    }

    addNotification('Saving...', 'neutral');

    try {
      await saveCollectionInDB(collection, collectionMetadata);
      setUnsavedChanges(false);
      addNotification('Saved Successfully', 'success');
    } catch (error) {
      addNotification("Error saving survey", 'error');
      console.error("Error saving collection in DB: ", error);
    }
  }

  const deleteAllData = () => {
    setCollection(null);
    setCollectionMetadata(null);
    setUnsavedChanges(false);
  }



  return (
    <SurveyDataContext.Provider
      value={{
        collection, setCollection, collectionMaster, setCollectionMaster,
        collectionMetadata, setCollectionMetadata, unsavedChanges, setUnsavedChanges,
        createTemplateSurvey, saveCollection, deleteAllData
      }}>
      {children}
    </SurveyDataContext.Provider>
  );
};


