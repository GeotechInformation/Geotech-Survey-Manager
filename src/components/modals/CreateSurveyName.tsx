// Create Survey Name tsx

import { checkSurveyNameExistsInB } from "@/services";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNotification } from "../providers/NotificationProvider";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";

interface CreateSurveyNameProps {
  surveyType: string;
  onClose: () => void;
}

const CreateSurveyName: React.FC<CreateSurveyNameProps> = ({ surveyType, onClose }) => {
  const { addNotification } = useNotification();
  const { createTemplateSurvey } = useSurveyDataContext();
  const [surveyName, setSurveyName] = useState<string>("");


  const handleCreateSurvey = async () => {
    const validName = surveyName.trim();
    if (!validName || validName.length <= 0) return;

    if (!surveyType) {
      console.log("No survey type");
      addNotification("Error occured", "error");
      return;
    }

    try {
      const exists = await checkSurveyNameExistsInB(validName);
      if (exists) {
        addNotification("Survey Name Already Exists", "error");
        return;
      }

      createTemplateSurvey(validName, surveyType);
      onClose();
    } catch (error) {
      console.log("Error Creating Survey Template: ", error);
      addNotification("Error Creating Survey", "error");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleCreateSurvey();
  };

  return (createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-hsl-l100 dark:bg-hsl-l15 rounded-md shadow-sm  border border-hsl-l95 dark:border-none py-8 px-16 flex flex-col justify-center items-center">
        <h2 className="font-semibold mb-8">Create New Survey</h2>
        <input type="text" placeholder="Enter survey name"
          value={surveyName} onChange={(e) => setSurveyName(e.target.value)} onKeyDown={handleKeyDown}
          className="df-input" />

        <div className="flex justify-between w-full mt-8">
          <button onClick={onClose}
            className="bg-hsl-l95 dark:bg-hsl-l20 px-4 py-1 rounded-md hover:bg-hsl-l90 dark:hover:bg-hsl-l25" >
            Cancel
          </button>

          <button onClick={handleCreateSurvey}
            className="bg-hsl-l95 dark:bg-hsl-l20 px-4 py-1 rounded-md hover:bg-mb-pink hover:dark:bg-mb-yellow hover:text-white hover:dark:text-black">
            Enter
          </button>
        </div>

      </div>
    </div>,
    document.body));
};

export default CreateSurveyName;