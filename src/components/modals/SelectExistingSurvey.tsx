// Create Survey Name tsx

import { createPortal } from "react-dom";
import { useNotification } from "../providers/NotificationProvider";
import { useEffect, useState } from "react";
import { getCollectionQuestions, getExistingCollectionMetadata } from "@/services";
import IconGeneral from "../icons/IconGeneral";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import { CollectionMetadata } from "@/types/CollectionMetadata";

interface SelectExistingSurveyProps {
  onClose: () => void;
}

const SelectExistingSurvey: React.FC<SelectExistingSurveyProps> = ({ onClose }) => {
  const { addNotification } = useNotification();
  const { setCollection, setCollectionMetadata } = useSurveyDataContext();
  const [surveyMetadata, setSurveyMetadata] = useState<Record<string, CollectionMetadata[]> | null>(null);


  /**
   * Group By First Letter
   * @param names 
   * @returns 
   */
  const groupByFirstLetter = (metadata: CollectionMetadata[]) => {
    return metadata.reduce((acc: Record<string, CollectionMetadata[]>, data: CollectionMetadata) => {
      const firstLetter = data.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(data);
      return acc;
    }, {});
  };

  useEffect(() => {
    const fetchExistingSurveyMetadata = async () => {
      try {
        const metadata = await getExistingCollectionMetadata();
        const groupedMetadata = groupByFirstLetter(metadata);
        setSurveyMetadata(groupedMetadata);
      } catch (error) {
        addNotification("Error Fetching Surveys", "error");
        console.error("Error fetching Survey Metadata: ", error);
      }
    };

    fetchExistingSurveyMetadata();
  }, []);

  const selectSurveyCollection = async (name: string) => {
    try {
      const response = await getCollectionQuestions(name);
      if ('success' in response) {
        if (!response.success) {
          addNotification(response.message!, 'error');
          return;
        }
      }

      if (Array.isArray(response)) {
        setCollection(response);
      }

      // Iterate over the grouped metadata by first letter
      Object.values(surveyMetadata!).forEach((metadataArray) => {
        const foundMetadata = metadataArray.find((metadata) => metadata.name === name);
        if (foundMetadata) {
          setCollectionMetadata(foundMetadata);
        }
      });

      onClose();
    } catch (error) {
      addNotification("Error loading survey", "error");
      console.error("Error selecting survey: ", error);
    }
  }

  return (createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative max-h-[80vh] min-w-[40vw] flex flex-col rounded-md shadow-sm py-8 px-8 
        bg-hsl-l100 dark:bg-hsl-l15"
      >
        <button onClick={onClose}
          className="absolute -top-0 -right-0 bg-rose-500 dark:bg-rose-700 px-3 py-1 rounded-tr-md hover:bg-rose-600 dark:hover:bg-rose-600" >
          <IconGeneral type="close" className="fill-white dark:fill-white" />
        </button>

        <h2 className="font-semibold mb-4 text-center">Select Existig Survey</h2>

        <div className="flex flex-col flex-grow overflow-y-scroll custom-scrollbar">
          {surveyMetadata ? (
            Object.keys(surveyMetadata).sort().map((letter) => (
              <div key={letter}>
                <div className="flex items-center">
                  <div className="w-[5%] border-b border-hsl-l80 dark:border-hsl-l25"></div>
                  <h3 className="font-bold mx-4 text-hsl-l50">{letter}</h3>
                  <div className=" w-[95%] border-b border-hsl-l80 dark:border-hsl-l25"></div>
                </div>
                {surveyMetadata[letter].map((surveyMetadata) => (
                  <div key={surveyMetadata.name}
                    className="cursor-pointer bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l90 hover:dark:bg-hsl-l25 py-2 px-4 m-4 rounded-md"
                    onClick={() => selectSurveyCollection(surveyMetadata.name)}>
                    <p>{surveyMetadata.name}</p>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>Loading survey names...</p>
          )}
        </div>



      </div>
    </div>,
    document.body));
};

export default SelectExistingSurvey;