// Toolbar tsx

"use client";

import { useState } from "react";
import IconGeneral from "../icons/IconGeneral";
import IconLogo from "../icons/IconLogo";
import { useSettingsContext } from "../providers/SettingsProvider";
import { useNotification } from "../providers/NotificationProvider";
import { useSurveyDataContext } from "../providers/SurveyDataProvider";
import { generateExcelSurvey } from "@/services";
import { AnimatePresence, motion } from "framer-motion";
import ToolbarButton from "./ToolbarButton";
import dynamic from "next/dynamic";
import ExcelJS from "exceljs";

import initializeFrequenciesFromSurveys from "@/services/database/initFreqFromSurveys";
import { extractSurveyTypeIDs } from "@/services/extractSurveyType";
import { removeSurveyTypeFromMasterCollection } from "@/services/removeSurveyType";
import deleteCollectionInDB from "@/services/database/deleteCollectionInDB";
import { SiteData } from "@/types/SiteData";

type EditActionType = 'none' | 'interchange' | 'createQuestion' | 'editQuestion' | 'createComp';

const DynCreateSurveyNameModal = dynamic(() => import("../modals/CreateSurveyName"), { loading: () => <></> });
const DynSelectExistingSurveyModal = dynamic(() => import("../modals/SelectExistingSurvey"), { loading: () => <></> });
const DynEditQuestionModal = dynamic(() => import("../modals/EditCollectionQuestions"), { loading: () => <></> });


const Toolbar = () => {
  const { addNotification } = useNotification();
  const { collection, collectionMetadata, siteData, setSiteData, searchQuery, setSearchQuery, saveCollection, unsavedChanges, deleteAllData } = useSurveyDataContext();
  const { geoColor, setGeoColor, QGridColumns, setQGridColumns } = useSettingsContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedSurveyType, setSelectedSurveyType] = useState<string | null>(null);
  const [isSelectSurveyModalOpen, setIsSelectSurveyModalOpen] = useState<boolean>(false);
  const [editSurveyAction, setEditSurveyAction] = useState<EditActionType>('none');


  /**
   * Export To Excel
   * @returns 
   */
  const exportToExcel = () => {
    try {
      if (!collection || collection.length <= 0 || !collectionMetadata) {
        addNotification("No Questions to Export. Add Questions", "neutral")
        return;
      }

      /**
       * **
       * 
       * LINK SITE DATA
       */
      generateExcelSurvey(collection, collectionMetadata, siteData);
    } catch (error) {
      console.log("Error Exporting Survey: ", error);
      addNotification("Error Occured", "error");
    }
  }

  /**
   * Handle Site File Upload
   * @param file 
   */
  const handleSiteFileUpload = async (file: File) => {

    try {
      // Create a new workbook and load the file
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      // Get the first worksheet
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        addNotification("Worksheet is undefined", "error")
        console.error("Worksheet not found");
        return;
      }

      // Extract data from each row and map it into siteData format
      const parsedData: SiteData = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip the header row
        const rowData: { [key: number]: string | number | null } = {}; // Only allow string, number, or null

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Only store values if they are strings or numbers
          if (typeof cell.value === "string" || typeof cell.value === "number") {
            rowData[colNumber] = cell.value;
          } else {
            rowData[colNumber] = null; // Set to null if not string or number
            console.error("PUSHED NULL IN CELL. Cell value is neither string or numbr?");
          }
        });

        parsedData.push(rowData);
      });

      // Set the parsed data in siteData
      setSiteData(parsedData);
      console.log("Site data has been set:", parsedData);
    } catch (error) {
      addNotification("Error adding Site Data", "error");
      console.error("Failed to process the file", error);
    }
  };


  /**
   * Handle Create Survey
   * @param type 
   */
  const handleCreateSurvey = (type: string) => {
    setSelectedSurveyType(type);
    setIsCreateModalOpen(true);
  };

  /**
   * Handle Create Survey Modal Close
   */
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedSurveyType(null);
  };

  /**
   * Open Edit Survey Modal
   * @param action 
   * @returns 
   */
  const openEditSurveyModal = (action: EditActionType) => {
    if (!collection) {
      addNotification("Create a new or load an existing survey to edit", "neutral");
      return;
    }
    setEditSurveyAction(action)
  };


  const DO_STUFF = async () => {
    // const dbs = ['CollectionNameHere'];
    // await initializeFrequenciesFromSurveys(dbs);

    // await extractSurveyTypeIDs();

    // await removeSurveyTypeFromMasterCollection();

    // await deleteCollectionInDB("Surevey_Training");
  }

  return (
    <div className="w-full px-4 py-1 flex justify-between items-center rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">

      {/* <button onClick={DO_STUFF}>DO_STUFF</button> */}

      <div className="flex gap-x-4 items-center">
        {/* FILE */}
        <div className="group relative cursor-pointer ">
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">File</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="Add Sites" icon="add-sites" fnc={handleSiteFileUpload} />
            <button type="button" onClick={exportToExcel}
              className="group/item flex items-center gap-x-2 hover:bg-hsl-l98 hover:dark:bg-hsl-l25 px-4 py-4 rounded-md">
              <svg width={24} height={24} viewBox="0 0 50 50"
                className="flex-shrink-0 fill-hsl-l20 dark:fill-hsl-l80 group-hover/item:fill-g-orange group-hover/item:dark:fill-g-blue">
                <path d="M 28.8125 0.03125 L 0.8125 5.34375 C 0.339844 5.433594 0 5.863281 0 6.34375 L 0 43.65625 C 0 44.136719 0.339844 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 28.875 49.980469 28.9375 50 29 50 C 29.230469 50 29.445313 49.929688 29.625 49.78125 C 29.855469 49.589844 30 49.296875 30 49 L 30 1 C 30 0.703125 29.855469 0.410156 29.625 0.21875 C 29.394531 0.0273438 29.105469 -0.0234375 28.8125 0.03125 Z M 32 6 L 32 13 L 34 13 L 34 15 L 32 15 L 32 20 L 34 20 L 34 22 L 32 22 L 32 27 L 34 27 L 34 29 L 32 29 L 32 35 L 34 35 L 34 37 L 32 37 L 32 44 L 47 44 C 48.101563 44 49 43.101563 49 42 L 49 8 C 49 6.898438 48.101563 6 47 6 Z M 36 13 L 44 13 L 44 15 L 36 15 Z M 6.6875 15.6875 L 11.8125 15.6875 L 14.5 21.28125 C 14.710938 21.722656 14.898438 22.265625 15.0625 22.875 L 15.09375 22.875 C 15.199219 22.511719 15.402344 21.941406 15.6875 21.21875 L 18.65625 15.6875 L 23.34375 15.6875 L 17.75 24.9375 L 23.5 34.375 L 18.53125 34.375 L 15.28125 28.28125 C 15.160156 28.054688 15.035156 27.636719 14.90625 27.03125 L 14.875 27.03125 C 14.8125 27.316406 14.664063 27.761719 14.4375 28.34375 L 11.1875 34.375 L 6.1875 34.375 L 12.15625 25.03125 Z M 36 20 L 44 20 L 44 22 L 36 22 Z M 36 27 L 44 27 L 44 29 L 36 29 Z M 36 35 L 44 35 L 44 37 L 36 37 Z" />
              </svg>
              <p className="text-sm group-hover/item:text-g-orange dark:group-hover/item:text-g-blue">Export to Excel</p>
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
          <p className="group-hover:bg-hsl-l95 group-hover:dark:bg-hsl-l20 py-1 px-4 rounded-md font-medium">Edit</p>
          <div className="group-hover:flex flex-col z-50 w-max hidden absolute top-full bg-hsl-l100 dark:bg-hsl-l20 rounded-md shadow-md border border-hsl-l90 dark:border-hsl-l25">
            <ToolbarButton label="Add / Remove Questions" icon="swap" fnc={() => openEditSurveyModal('interchange')} />
            <ToolbarButton label="Edit Questions" icon="edit-question" fnc={() => openEditSurveyModal('editQuestion')} />
            <ToolbarButton label="Create Question" icon="create-question" fnc={() => openEditSurveyModal('createQuestion')} />
            <ToolbarButton label="Create Competitor" icon="create-competitor" fnc={() => openEditSurveyModal('createComp')} />
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

        <button type="button" title="Delete All" onClick={deleteAllData}
          className="group px-2 py-2 hover:bg-hsl-l95 hover:dark:bg-hsl-l20 rounded-md flex-shrink-0">
          <IconGeneral type="delete" className="group-hover:fill-red-500 group-hover:dark:fill-red-600" />
        </button>
      </div>

      {isCreateModalOpen && selectedSurveyType && (<DynCreateSurveyNameModal onClose={handleCreateModalClose} surveyType={selectedSurveyType} />)}
      {isSelectSurveyModalOpen && (<DynSelectExistingSurveyModal onClose={() => setIsSelectSurveyModalOpen(false)} />)}


      <AnimatePresence>
        {editSurveyAction !== 'none' && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="top-0 right-0 bottom-0 h-[100vh] w-[65vw] bg-hsl-l98 dark:bg-hsl-l10 rounded-md"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <DynEditQuestionModal action={editSurveyAction} onClose={() => setEditSurveyAction('none')} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Toolbar;
