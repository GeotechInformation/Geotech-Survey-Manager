// Survey Validate Button tsx

import { validateSurvey } from "@/services";
import { useNotification } from "../providers/NotificationProvider";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";


const SurveyValidateButton = () => {
  const { addNotification } = useNotification();
  const { surveyData, surveyNameFirestore, setErrors } = useAnalysisDataContext();

  const validate = async () => {
    if (!surveyData) {
      addNotification('Upload Survey File', 'error');
      return;
    }

    if (!surveyNameFirestore) {
      addNotification('Enter Survey Name', 'error');
      return;
    }

    try {
      const errors = await validateSurvey(surveyData, surveyNameFirestore);

      setErrors((prevErrors) => ({
        ...prevErrors,
        ['validateSurvey']: [...errors],
      }));

      addNotification('Validation Process Complete', 'success')
    } catch (error) {
      addNotification('Unexpectd Error Validating Survey', 'error');
      console.error(error);
    }
  };

  return (
    <button type="button" onClick={validate}
      className="bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25 px-2 py-2 rounded-md">Validate Survey Data</button>
  );
}

export default SurveyValidateButton;