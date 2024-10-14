// Survey Name Input tsx

"use client";

import { useEffect, useState } from "react";
import { useNotification } from "../providers/NotificationProvider";
import { checkSurveyNameExistsInB } from "@/services";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";


const SurveyNameInput = () => {
  const { surveyNameFirestore, setSurveyNameFirestore } = useAnalysisDataContext();
  const { addNotification } = useNotification();
  const [surveyName, setSurveyName] = useState<string>('');
  const [surveyExists, setSurveyExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (surveyName !== surveyNameFirestore) {
      setSurveyExists(null);
    } else {
      setSurveyExists(true);
    }
  }, [surveyName])

  const getSurveyName = async () => {
    setSurveyExists(null);
    if (surveyName.length <= 0) return;

    try {
      const surveyExists = await checkSurveyNameExistsInB(surveyName);
      if (surveyExists) {
        setSurveyExists(true);
        setSurveyNameFirestore(surveyName);
      } else {
        setSurveyExists(false);
        addNotification('Survey Name Does Not Exists', 'error');
      }
    } catch (error) {
      addNotification('Unexpected Error Occured', 'error');
      console.error(error);
    }
  };

  /**
   * Handle Key Down
   * @param event 
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      getSurveyName();
    }
  };

  return (
    <div className="my-10">
      <label htmlFor="surveyInput" className="text-hsl-l50 text-sm">Enter Suvrey Name</label>
      <div className="flex gap-x-4">
        <input type="text" id="surveyInput" name="surveyInput" className='df-input w-full' autoComplete="off"
          value={surveyName} onChange={(event) => setSurveyName(event.target.value)} onKeyDown={handleKeyDown} />
        <button type="button" onClick={getSurveyName}
          className={` px-2 py-1 rounded-md flex flex-shrink-0 gap-x-2 items-center
          ${surveyExists === null ? 'bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25' :
              surveyExists ? 'bg-green-700 text-white dark:bg-green-800 hover:bg-green-800 dark:hover:bg-green-900' :
                'bg-red-500 dark:bg-red-800 text-white hover:bg-red-600 dark:hover:bg-red-900'
            }`}>
          {surveyExists && (
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill={'rgb(123, 219, 160)'} className="flex-shrink-0">
              <path d="m424-408-86-86q-11-11-28-11t-28 11q-11 11-11 28t11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28q-11-11-28-11t-28 11L424-408Zm56 328q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
          )}
          {surveyExists === null ? 'Check' : surveyExists ? '' : 'Invalid'}
        </button>
      </div>
    </div>
  );
};

export default SurveyNameInput;