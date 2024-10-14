// AIO Merge Button tsx

import { useNotification } from "../providers/NotificationProvider";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";
import { mergeData } from "@/services";

const AIOMergeButton = () => {
  const { addNotification } = useNotification();
  const { aioData, surveyData, salesData, setAllData, setErrors } = useAnalysisDataContext();

  const merge = async () => {
    if (!aioData) {
      addNotification('No AIO Data. Skipping merge of files', 'error')
      return;
    };

    if (!surveyData && !salesData) {
      addNotification('Missing Survey and Sales Data.Skipping Merge', 'error');
      return;
    }

    try {
      const response = await mergeData(aioData, surveyData, salesData);

      setErrors((prevErrors) => ({
        ...prevErrors,
        ['merge']: [...response.errors],
      }));

      setAllData(response.df);

      addNotification('Merge Complete', 'success');
    } catch (error) {
      addNotification('Unexpectd Error Merging Data', 'error');
      console.error(error);
    }
  };

  return (
    <button type="button" onClick={merge}
      className="bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25 px-2 py-2 rounded-md">Merge Data</button>
  );
}

export default AIOMergeButton;