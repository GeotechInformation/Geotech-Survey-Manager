// Rename Collection tsx

"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { getExistingCollectionMetadata, getUserValue, renameCollectionInDB } from "@/services";
import { CollectionMetadata } from "@/types/CollectionMetadata";
import { useEffect, useState } from "react";

const RenameCollection = () => {
  const { user, loading } = useAuth();
  const { addNotification } = useNotification();
  const [surveyMetadata, setSurveyMetadata] = useState<Record<string, CollectionMetadata[]> | null>(null);
  const [oldName, setOldName] = useState<string>('None');
  const [newName, setNewName] = useState<string>('');

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

  /**
   * Fetch Existing Survey Metadata
   */
  useEffect(() => {
    if (!user) {
      addNotification("User Not Authenticated", "error");
      return;
    }

    const fetchExistingSurveyMetadata = async () => {
      try {
        const isAdmin = await getUserValue(user?.uid, "admin");
        const metadata = await getExistingCollectionMetadata();

        // Filter out "Admin Collections" and deleted collections
        const filteredMetadata = metadata.filter(
          (item) =>
          (!item.deleted && // Exclude collections with a "deleted" field
            (isAdmin || (item.name !== "#_MasterCollection" && item.name !== "AAA_CompetitorCollection")))
        );

        const groupedMetadata = groupByFirstLetter(filteredMetadata);
        setSurveyMetadata(groupedMetadata);
      } catch (error) {
        addNotification("Error Fetching Surveys", "error");
        console.error("Error fetching Survey Metadata: ", error);
      }
    };

    fetchExistingSurveyMetadata();
  }, [user]);

  /**
   * Rename Existing Collection
   * Actually just creates a new collectiona and deletes the existing
   */
  const renameExistingCollection = async () => {
    const validOldName = oldName.trim();
    const validNewName = newName.trim();
    if (!validOldName || validOldName.length <= 0 || !validNewName || validNewName.length <= 0) {
      addNotification("Fields cannot be empty", "error");
      return;
    }

    if (validOldName === validNewName) {
      addNotification("Names are the same", "error");
      return;
    }

    try {
      const status = await renameCollectionInDB(oldName, newName);
      if (!status.success) {
        addNotification(status.message!, "error");
        return;
      }

      addNotification("Survey Renamed. Refresh Page!", "success");
    } catch (error) {
      addNotification("Error Renaming", "error");
      console.log("Error Renaming: ", error);
    }

  };

  return (
    <div className="w-full h-[80vh] px-8 py-4 my-4 rounded-md shadow-sm bg-hsl-l100 dark:bg-hsl-l15 border border-hsl-l95 dark:border-none">
      <div className="grid grid-cols-2 gap-x-4 h-full">
        {/* UPDATE NAME */}
        <div className="flex flex-col">
          <p className="text-sm mb-2 text-hsl-l50">Existing Survey:</p>
          <h2 className="font-semibold text-2xl mb-6">{oldName}</h2>

          <label htmlFor="newName" className="text-sm mb-2 text-hsl-l50">Enter New Name</label>

          <input type="text" id="newName" name="newName" autoComplete="off" placeholder="Survey Name..."
            className='df-input max-w-[50%]'
            value={newName} onChange={(e) => setNewName(e.target.value)} />

          <div className="mt-8">
            <button type="button" onClick={renameExistingCollection}
              className="px-4 py-2 rounded-md bg-hsl-l95 dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25">Update Survey Name</button>
          </div>
        </div>

        {/* SURVEY NAMES */}
        <div className="h-full flex flex-col flex-grow overflow-y-scroll custom-scrollbar">
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
                    onClick={() => setOldName(surveyMetadata.name)}>
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

    </div>
  );
};

export default RenameCollection;