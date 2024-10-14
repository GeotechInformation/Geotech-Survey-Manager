// Analyse Button tsx

import { useNotification } from "../providers/NotificationProvider";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";
import * as dfd from 'danfojs';
import IconGeneral from "../icons/IconGeneral";
import { generateExcelAIO } from "@/services";

const DownloadButton = () => {
  const { addNotification } = useNotification();
  const { allData, metadataAll, dfOutputs } = useAnalysisDataContext();

  const downloadAIO = async () => {
    if (!allData) {
      addNotification('No AIO Data availible', 'error');
      return;
    };

    if (!metadataAll) {
      addNotification('Metadata has not been merged', 'error');
      return;
    };

    try {
      const errors = generateExcelAIO(allData, metadataAll);
    } catch (error) {
      addNotification('Unexpectd Error Analysing Survey', 'error');
      console.error(error);
    }
  };

  const downloadPrelim = () => {
    if (!dfOutputs || dfOutputs.length === 0) {
      addNotification('No Output Data availible', 'error');
      return;
    }

    const fileNames = ["CorrelationAll", "CorrelationTriage", "MissingData"];


    try {
      dfOutputs.forEach((df, index) => {
        const fileName = `${fileNames[index]}.xlsx`;
        dfd.toExcel(df, { fileName });
      });
    } catch (error) {

    }
  }

  return (
    <div>
      <p className="text-hsl-l50 text-sm">Download</p>

      <div className="flex items-center gap-x-8">
        <button type="button" onClick={downloadAIO}
          className="flex justify-center items-center flex-grow gap-x-2 bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25 px-2 py-2 rounded-md">
          AIO
          <IconGeneral type="download" className="fill-hsl-l70 dark:fill-hsl-l30" />
        </button>

        <button type="button" onClick={downloadPrelim}
          className="flex justify-center items-center flex-grow gap-x-2 bg-hsl-l90 dark:bg-hsl-l20 hover:bg-hsl-l85 hover:dark:bg-hsl-l25 px-2 py-2 rounded-md">
          Prelim Analysis
          <IconGeneral type="download" className="fill-hsl-l70 dark:fill-hsl-l30" />
        </button>
      </div>
    </div>
  );
}

export default DownloadButton;