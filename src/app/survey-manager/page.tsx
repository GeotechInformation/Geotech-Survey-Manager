// Survey Manager Page tsx

"use client";

import { useEffect } from "react";
import Header from "@/components/layout/Header";
import { SurveyDataProvider, useSurveyDataContext } from "@/components/providers/SurveyDataProvider";
import QuestionContainer from "@/components/survey/QuestionContainer";
import Toolbar from "@/components/toolbar/Toolbar";

function SurveyManager() {
  const { unsavedChanges } = useSurveyDataContext();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // This triggers the browser's confirmation dialog
      }
    };

    // Attach the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  return (
    <div className="px-4 mb-8">
      <Header />
      <Toolbar />
      <QuestionContainer />
    </div>
  );
}

export default function SurveyManagerPage() {
  return (
    <SurveyDataProvider>
      <SurveyManager />
    </SurveyDataProvider>
  );
}