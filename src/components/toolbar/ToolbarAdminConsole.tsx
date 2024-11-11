// Toolbar Admin Console tsx

"use client";

import migrateQuestions from "@/services/migrateQuestion";
import IconGeneral from "../icons/IconGeneral";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import ToolbarButton from "./ToolbarButton";


type ActionType = 'none' | 'rename' | 'load';


interface ToolbarAdminConsole {
  setCurAction: (action: ActionType) => void;
}

const ToolbarAdminConsole: React.FC<ToolbarAdminConsole> = ({ setCurAction }) => {
  const { collectionMetadata, saveCollection, unsavedChanges, deleteAllData } = useSurveyDataContext();

  const doUpdateFunction = async () => {
    // const dbs = ['CollectionNameHere'];
    // await initializeFrequenciesFromSurveys(dbs);

    // await extractSurveyTypeIDs();

    // await removeSurveyTypeFromMasterCollection();

    // await deleteCollectionInDB("Surevey_Training");

    await migrateQuestions("BakersDelight");
  };

  return (
    <div className="w-full px-4 py-1 flex justify-between items-center rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">

      <div className="flex gap-x-4 items-center">
        {/* SURVEY */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Survey</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="Rename Survey" icon="edit-question" fnc={() => { setCurAction('rename') }} />
            <ToolbarButton label="Load Master" icon="download" fnc={() => { setCurAction('load') }} />
          </div>
        </div>

        {/* Create */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Edit</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            {/* <ToolbarButton label="Add / Remove Questions" icon="swap" fnc={() => openEditSurveyModal('interchange')} /> */}
          </div>
        </div>

        <button type="button" onClick={doUpdateFunction}
          className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium hover:bg-hsl-l90">
          Do Update Fnc
        </button>


        {/* Survey Name and Save Button */}
        {collectionMetadata && (
          <div className="ml-4 gap-x-4 flex justify-center items-center">
            <p className="font-bold">{collectionMetadata.name}</p>

            <button type="button" title="Save Changes" className="relative" onClick={saveCollection}>
              <IconGeneral type="save" className="hover:fill-g-orange hover:dark:fill-g-blue" />

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
        <button type="button" title="Delete All" onClick={deleteAllData}
          className="group px-2 py-2 hover:bg-hsl-l95 hover:dark:bg-hsl-l20 rounded-md flex-shrink-0">
          <IconGeneral type="delete" className="group-hover:fill-red-500 group-hover:dark:fill-red-600" />
        </button>
      </div>

    </div>
  );
};

export default ToolbarAdminConsole;
