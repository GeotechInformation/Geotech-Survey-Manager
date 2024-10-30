// Survey Data Provider tsx

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useNotification } from './NotificationProvider';
import { getCollectionQuestions, getQuestionIdsForSurveyType, getUserValue, saveCollectionInDB, updateQuestionFrequency } from '@/services';
import { Question } from '@/types/Question';
import { CollectionMetadata } from '@/types/CollectionMetadata';
import { useAuth } from './AuthProvider';

interface SurveyDataContextType {
  collection: Question[] | null;
  setCollection: React.Dispatch<React.SetStateAction<Question[] | null>>;
  collectionMaster: Question[] | null;
  setCollectionMaster: React.Dispatch<React.SetStateAction<Question[] | null>>;
  collectionCompetitors: Question[] | null;
  setCollectionCompetitors: React.Dispatch<React.SetStateAction<Question[] | null>>;

  // Collection Metadata
  collectionMetadata: CollectionMetadata | null;
  setCollectionMetadata: React.Dispatch<React.SetStateAction<CollectionMetadata | null>>;

  // Unsaved Changes for tracking saved state
  unsavedChanges: boolean;
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;

  // Search Query
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

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
  const { user, loading } = useAuth();
  const [collection, setCollection] = useState<Question[] | null>(null);
  const [collectionMaster, setCollectionMaster] = useState<Question[] | null>(null);
  const [collectionCompetitors, setCollectionCompetitors] = useState<Question[] | null>(null);
  const [collectionMetadata, setCollectionMetadata] = useState<CollectionMetadata | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");


  /**
   * Get Master Questions
   */
  useEffect(() => {
    if (!addNotification) return;
    const getMasterQuestions = async () => {
      try {
        const response = await getCollectionQuestions('#_MasterCollection');
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
        addNotification('Error Fetching Data. Please refresh', 'error');
        console.error(error);
      }
    }

    getMasterQuestions();
  }, [addNotification, getCollectionQuestions]);

  /**
   * Get Competitor Questions
   */
  useEffect(() => {
    if (!addNotification) return;
    const getCompetitorQuestions = async () => {
      try {
        const response = await getCollectionQuestions('#_CompetitorCollection');
        if ('success' in response) {
          if (!response.success) {
            addNotification(response.message!, 'error');
            return;
          }
        }
        if (Array.isArray(response)) {
          // Sort the questions alphabetically by name (or any other field you prefer)
          const sortedCompetitors = response.sort((a, b) =>
            a.question.localeCompare(b.question)
          );

          // Set the sorted competitors into state
          setCollectionCompetitors(sortedCompetitors);
        }
      } catch (error) {
        addNotification('Error Fetching Data. Please refresh', 'error');
        console.error(error);
      }
    }

    getCompetitorQuestions();
  }, [addNotification, getCollectionQuestions]);


  /**
   * Create Template Survey
   * @param surveyName 
   * @param surveyType 
   * @returns 
   */
  const createTemplateSurvey = async (surveyName: string, surveyType: string) => {
    if (!collectionMaster) {
      addNotification("Collection Master is not initliased", "error");
      return;
    }

    if (!user) {
      addNotification("User Credentials are not authenticated / Synced", "error");
      return;
    }

    const userName = await getUserValue(user.uid, "userName");

    const metadata: CollectionMetadata = {
      name: surveyName,
      createdAt: {
        time: Timestamp.now(),
        userId: user.uid,
        userName: userName
      },
      lastSaved: {
        time: Timestamp.now(),
        userId: user.uid,
        userName: userName
      },
    }

    setCollectionMetadata(metadata);
    setUnsavedChanges(true);

    let selectedQuestions: Question[] = [];

    try {
      // Filter the collection based on the survey type or select all
      if (surveyType === "all") {
        selectedQuestions = collectionMaster;
      } else {
        const questionIds = await getQuestionIdsForSurveyType(surveyType);
        selectedQuestions = collectionMaster.filter((item) => questionIds.includes(item.id));
      }

      // Set the filtered questions to the survey
      setCollection(selectedQuestions);

      // Update the frequency field in master collection
      for (const question of selectedQuestions) {
        await updateQuestionFrequency(question.id, false, 1);
      }

      addNotification("Template survey created successfully!", "success");
    } catch (error) {
      addNotification("Error updating frequency. Can be ignored", "neutral")
      console.error(error);
    }
  };

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
      const status = await saveCollectionInDB(collection, collectionMetadata);
      if (!status.success) {
        addNotification(status.message!, "error");
        return;
      }
      setUnsavedChanges(false);
      addNotification('Saved Successfully', 'success');
    } catch (error) {
      addNotification("Error saving survey", 'error');
      console.error("Error saving collection in DB: ", error);
    }
  };

  const deleteAllData = () => {
    setCollection(null);
    setCollectionMetadata(null);
    setUnsavedChanges(false);
  };



  return (
    <SurveyDataContext.Provider
      value={{
        collection, setCollection, collectionMaster, setCollectionMaster, collectionCompetitors, setCollectionCompetitors,
        collectionMetadata, setCollectionMetadata, searchQuery, setSearchQuery, unsavedChanges, setUnsavedChanges,
        createTemplateSurvey, saveCollection, deleteAllData
      }}>
      {children}
    </SurveyDataContext.Provider>
  );
};


