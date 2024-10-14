// Toolbar tsx

"use client";

import { useState } from "react";
import IconGeneral from "../icons/IconGeneral";
import IconLogo from "../icons/IconLogo";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useNotification } from "../providers/NotificationProvider";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import { generateExcelSurvey } from "@/services";
import CreateSurveyName from "../modals/CreateSurveyName";
import SelectExistingSurvey from "../modals/SelectExistingSurvey";

interface ToolbarButtonProps {
  label: string;
  icon: string;
  fnc: (fncParams: any) => void;
  fncParams?: any;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, icon, fnc }) => {
  return (
    <button type="button" onClick={fnc}
      className="group/item flex items-center gap-x-2 hover:bg-hsl-l98 hover:dark:bg-hsl-l25 px-4 py-4 rounded-md">
      <IconGeneral type={icon}
        className="group-hover/item:fill-g-orange group-hover/item:dark:fill-g-blue" />
      <p className="text-sm group-hover/item:text-g-orange dark:group-hover/item:text-g-blue">{label}</p>
    </button>
  );
}

const Toolbar = () => {
  const { addNotification } = useNotification();
  const { collection, collectionMetadata, saveCollection, unsavedChanges } = useSurveyDataContext();
  const { geoColor, setGeoColor, QGridColumns, setQGridColumns } = useSettingsContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedSurveyType, setSelectedSurveyType] = useState<string | null>(null);
  const [isSelectSurveyModalOpen, setIsSelectSurveyModalOpen] = useState<boolean>(false);


  const exportToExcel = () => {
    try {
      if (!collection || collection.length <= 0) {
        addNotification("No Questions to Export. Add Questions", "neutral")
        return;
      }

      /**
       * LINK SITE DATA
       */
      generateExcelSurvey(collection, null);
    } catch (error) {
      console.log("Error Exporting Survey: ", error);
      addNotification("Error Occured", "error");
    }
  }


  // Open the modal with the selected survey type
  const handleCreateSurvey = (type: string) => {
    setSelectedSurveyType(type);
    setIsCreateModalOpen(true);
  };

  // Close the modal
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedSurveyType(null);
  };

  return (
    <div className="w-full mt-4 px-4 py-1 flex justify-between items-center rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">

      <div className="flex gap-x-4 items-center">
        {/* FILE */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">File</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="Add Sites" icon="add-sites" fnc={() => { }} />
            {/* <ToolbarButton label="Save Collection" icon="save" fnc={() => { }} /> */}
            <button type="button" onClick={exportToExcel}
              className="group/item flex items-center gap-x-2 hover:bg-hsl-l98 hover:dark:bg-hsl-l25 px-4 py-4 rounded-md">
              <svg width={24} height={24} viewBox="0 0 50 50"
                className="flex-shrink-0 fill-hsl-l20 dark:fill-hsl-l80 group-hover/item:fill-g-orange group-hover/item:dark:fill-g-blue">
                <path d="M 28.8125 0.03125 L 0.8125 5.34375 C 0.339844 5.433594 0 5.863281 0 6.34375 L 0 43.65625 C 0 44.136719 0.339844 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 28.875 49.980469 28.9375 50 29 50 C 29.230469 50 29.445313 49.929688 29.625 49.78125 C 29.855469 49.589844 30 49.296875 30 49 L 30 1 C 30 0.703125 29.855469 0.410156 29.625 0.21875 C 29.394531 0.0273438 29.105469 -0.0234375 28.8125 0.03125 Z M 32 6 L 32 13 L 34 13 L 34 15 L 32 15 L 32 20 L 34 20 L 34 22 L 32 22 L 32 27 L 34 27 L 34 29 L 32 29 L 32 35 L 34 35 L 34 37 L 32 37 L 32 44 L 47 44 C 48.101563 44 49 43.101563 49 42 L 49 8 C 49 6.898438 48.101563 6 47 6 Z M 36 13 L 44 13 L 44 15 L 36 15 Z M 6.6875 15.6875 L 11.8125 15.6875 L 14.5 21.28125 C 14.710938 21.722656 14.898438 22.265625 15.0625 22.875 L 15.09375 22.875 C 15.199219 22.511719 15.402344 21.941406 15.6875 21.21875 L 18.65625 15.6875 L 23.34375 15.6875 L 17.75 24.9375 L 23.5 34.375 L 18.53125 34.375 L 15.28125 28.28125 C 15.160156 28.054688 15.035156 27.636719 14.90625 27.03125 L 14.875 27.03125 C 14.8125 27.316406 14.664063 27.761719 14.4375 28.34375 L 11.1875 34.375 L 6.1875 34.375 L 12.15625 25.03125 Z M 36 20 L 44 20 L 44 22 L 36 22 Z M 36 27 L 44 27 L 44 29 L 36 29 Z M 36 35 L 44 35 L 44 37 L 36 37 Z" />
              </svg>
              <p className="text-sm group-hover/item:text-g-orange dark:group-hover/item:text-g-blue">Export to Exel</p>
            </button>
          </div>
        </div>

        {/* SURVEY */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Survey</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="All" icon="type-all" fnc={() => { handleCreateSurvey('all') }} />
            <ToolbarButton label="Freestand" icon="type-freestand" fnc={() => { handleCreateSurvey('freeStand') }} />
            <ToolbarButton label="Strip / Shopping Centre Ext." icon="type-strip" fnc={() => { handleCreateSurvey('strip') }} />
            <ToolbarButton label="Shopping Centre Int." icon="type-shop" fnc={() => { handleCreateSurvey('shoppingCentre') }} />
            <ToolbarButton label="Food Precinct" icon="type-food-precinct" fnc={() => { handleCreateSurvey('foodPrecinct') }} />
            <ToolbarButton label="Existing" icon="arrow-right" fnc={() => { setIsSelectSurveyModalOpen(true) }} />
          </div>
        </div>

        {/* Create */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Create</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="Question" icon="create-question" fnc={() => { }} />
            <ToolbarButton label="Competitor" icon="create-competitor" fnc={() => { }} />
          </div>
        </div>

        {/* Search Bar */}
        <input type="text" id="title" name="title" autoComplete="off" placeholder="Search"
          className='df-input leading-4 text-sm'
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        {/* Survey Name and Save Button */}
        {collectionMetadata && (
          <div className="ml-4 gap-x-4 flex justify-center items-center">
            <p className="font-bold">{collectionMetadata.name}</p>

            <button type="button" title="Save Changes" className="relative" onClick={saveCollection}>
              <IconGeneral type="save" />

              {unsavedChanges && (
                <div title="Unsaved Changes" className="absolute -top-[50%] -right-[50%] rounded-full ">
                  <IconGeneral type="error" size={24} className="fill-red-500 dark:fill-red-500 animate-pulse" />
                </div>
              )}
            </button>
          </div>
        )}
      </div>



      <div className="flex gap-x-4 items-center">
        <input type="range" title="Number of questions per row" min="2" max="12" value={QGridColumns}
          className="cursor-pointer appearance-none bg-hsl-l90 dark:bg-hsl-l25 w-full h-2 rounded-lg disabled:opacity-50 focus:outline-none 
          accent-hsl-l80 dark:accent-hsl-l30 focus:accent-g-blue hover:accent-g-blue dark:focus:accent-g-blue dark:hover:accent-g-blue"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQGridColumns(Number(e.target.value))} />

        <button type="button" title="Geotech Standard Colouring" onClick={() => { setGeoColor(!geoColor) }}
          className="px-2 py-2 hover:bg-hsl-l95 hover:dark:bg-hsl-l20 rounded-md flex-shrink-0">
          <IconLogo className={`${!geoColor && 'fill-hsl-l20 dark:fill-hsl-l80'}`} />
        </button>

        <button type="button" title="Preview as Excel" onClick={() => { }}
          className="px-2 py-2 hover:bg-hsl-l95 hover:dark:bg-hsl-l20 rounded-md flex-shrink-0">
          <IconGeneral type="preview" />
        </button>

        <button type="button" title="Delete All" onClick={() => { }}
          className="group px-2 py-2 hover:bg-hsl-l95 hover:dark:bg-hsl-l20 rounded-md flex-shrink-0">
          <IconGeneral type="delete" className="group-hover:fill-red-500 group-hover:dark:fill-red-600" />
        </button>
      </div>

      {isCreateModalOpen && selectedSurveyType && (<CreateSurveyName onClose={handleCreateModalClose} surveyType={selectedSurveyType} />)}
      {isSelectSurveyModalOpen && (<SelectExistingSurvey onClose={() => setIsSelectSurveyModalOpen(false)} />)}

    </div>
  );
};

export default Toolbar;
