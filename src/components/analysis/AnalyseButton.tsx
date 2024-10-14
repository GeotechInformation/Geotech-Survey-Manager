// Analyse Button tsx

import { useNotification } from "../providers/NotificationProvider";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";
import { analyseData } from "@/services";

const AnalyseButton = () => {
  const { addNotification } = useNotification();
  const { allData, metadataData, surveyNameFirestore, setMetadataAll, setDfOutputs } = useAnalysisDataContext();

  const analyse = async () => {
    if (!allData) {
      addNotification('No Merged Data availible', 'error');
      return;
    };

    if (!metadataData) {
      addNotification('No Meta Data availible', 'error');
      return;
    };

    if (!surveyNameFirestore) {
      addNotification('Enter Survey Name', 'error');
      return;
    }

    try {
      const dfs = await analyseData(allData, metadataData, surveyNameFirestore);
      setMetadataAll(dfs[0]);
      setDfOutputs([dfs[1], dfs[2], dfs[3]]);

      addNotification('Analysis Complete', 'success');
    } catch (error) {
      addNotification('Unexpectd Error Analysing Survey', 'error');
      console.error(error);
    }
  };

  return (
    <button type="button" onClick={analyse}
      className="bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25 px-2 py-2 rounded-md">Analyse</button>
  );
}

export default AnalyseButton;