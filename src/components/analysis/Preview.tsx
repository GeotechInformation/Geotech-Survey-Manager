// Preview tsx


import { useState } from "react";
import { useAnalysisDataContext } from "../providers/AnalysisDataProvider";
import DataframeTable from "./DataframeTable";


const Preview = () => {
  const { aioData, salesData, surveyData, errors } = useAnalysisDataContext();
  const [previewType, setPreviewType] = useState<string>('errors');


  const setPreview = (type: string) => {
    if (aioData && type === 'aio') setPreviewType(type);
    else if (salesData && type === 'sales') setPreviewType(type);
    else if (surveyData && type === 'survey') setPreviewType(type);
    else if (type === 'errors') setPreviewType('errors');
  }


  return (
    <div className="w-full h-full">

      <div className="w-full rounded-md flex gap-x-8 my-4 px-4">
        <button type="button" onClick={() => setPreview('errors')}
          className={`cursor-pointer py-2 px-2 font-medium rounded-md bg-hsl-l85 dark:bg-hsl-l20 hover:bg-g-blue dark:hover:bg-g-blue hover:text-hsl-l100 border
          ${previewType === 'errors' ? 'border-g-blue' : ' border-hsl-l85 dark:border-hsl-l20'}`}>
          Error Log
        </button>

        <button type="button" onClick={() => setPreview('aio')}
          className={`cursor-pointer py-2 px-2 font-medium rounded-md bg-hsl-l85 dark:bg-hsl-l20 border
          ${aioData ? 'hover:bg-g-blue dark:hover:bg-g-blue hover:text-hsl-l100' : 'text-hsl-l50'}
          ${previewType === 'aio' ? 'border-g-blue' : ' border-hsl-l85 dark:border-hsl-l20'}`}>
          AIO Preview
        </button>

        <button type="button" onClick={() => setPreview('sales')}
          className={`cursor-pointer py-2 px-2 font-medium rounded-md bg-hsl-l85 dark:bg-hsl-l20 border 
            ${salesData ? 'hover:bg-g-blue dark:hover:bg-g-blue hover:text-hsl-l100' : 'text-hsl-l50'}
            ${previewType === 'sales' ? 'border-g-blue' : ' border-hsl-l85 dark:border-hsl-l20'}`}>
          Sales Preview
        </button>

        <button type="button" onClick={() => setPreview('survey')}
          className={`cursor-pointer py-2 px-2 font-medium rounded-md bg-hsl-l85 dark:bg-hsl-l20 border
            ${surveyData ? 'hover:bg-g-blue dark:hover:bg-g-blue hover:text-hsl-l100' : 'text-hsl-l50'}
            ${previewType === 'survey' ? 'border-g-blue' : ' border-hsl-l85 dark:border-hsl-l20'}`}>
          Survey Preview
        </button>
      </div>

      {previewType === 'errors' && (
        <div className="px-4 overflow-auto custom-scrollbar max-h-[70vh]">
          {Object.keys(errors).map((key) => (
            <div key={key}>
              <h1 className="font-bold text-xl mt-4">
                {key === 'validateSurvey' ? 'Survey Validation Errors' :
                  key === 'merge' ? 'Merging Data Errors' : key}</h1>

              {errors[key]
                .slice() // Create a copy of the array to avoid mutating the original state
                .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
                .map((error, index) => (
                  <p key={index} className={`${error === 'No Errors!' ? 'text-green-600' : 'text-red-600'}`}>
                    {error}
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}

      {previewType === 'aio' && aioData && (
        <DataframeTable df={aioData} />
      )}

      {previewType === 'sales' && salesData && (
        <DataframeTable df={salesData} />
      )}

      {previewType === 'survey' && surveyData && (
        <DataframeTable df={surveyData} />
      )}

    </div >
  );
}

export default Preview;