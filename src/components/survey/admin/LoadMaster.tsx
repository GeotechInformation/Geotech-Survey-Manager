// Load (Download / Upload) Master Collection

"use client";

import IconGeneral from "@/components/icons/IconGeneral";
import { useNotification } from "@/components/providers/NotificationProvider";
import { exportMasterToExcel, uploadExcelToMaster } from "@/services";
import { useRef, useState } from "react";

const LoadMaster = () => {
  const { addNotification } = useNotification();
  const [localFile, setLocalFile] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Download Master
   */
  const downloadMaster = async () => {
    try {
      await exportMasterToExcel();
      console.log("Exported questions to AAA_MasterCollection_Questions.xlsx");
    } catch (error) {
      addNotification("Error Downloading", "error");
      console.error("Error Downloading: ", error);
    }
  };

  /**
   * Handle File Upload
   * @param event 
   * @returns 
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Check if a file was uploaded
    setLocalFile(file);

    if (file) {
      const fileExtension = file.name.split('.').pop();
      if (fileExtension !== 'xlsx') {
        addNotification("File not supported. Only '.xlsx' allowed", 'error');
        console.log('File is not supported');
        handleFileRemove();
        return;
      }

      try {
        await uploadExcelToMaster(file, "AAA_MasterCollection");

      } catch (error) {
        addNotification('Error Uploading File', 'error');
        console.error('Error reading file:', error);
      }
    }
  };

  /**
   * Handle File Remove
   */
  const handleFileRemove = () => {
    setLocalFile(undefined);

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full h-[80vh] my-4 ">
      <div className="grid grid-cols-2 gap-x-4 h-full">

        <div className="px-8 py-4">
          <h1 className="font-medium text-xl text-center">Download Master Collection</h1>
          <p className="text-hsl-l50 text-center">As Excel</p>

          <div className="flex justify-center mt-8">
            <button type="button" onClick={downloadMaster}
              className="px-4 py-1 bg-hsl-l100 shadow-sm dark:bg-hsl-l20 hover:bg-hsl-l98 dark:hover:bg-hsl-l25 rounded-md">Download</button>
          </div>
        </div>

        <div className="px-8 py-4 flex flex-col items-center">
          <h1 className="font-medium text-xl text-center">Upload Master Collection</h1>
          <p className="text-hsl-l50 text-center">Accepts Excel</p>


          <div className="bg-hsl-l95 dark:bg-hsl-l20 w-[50%] h-full max-w-[300px] max-h-[150px] rounded-lg p-3 mx-auto mt-8 relative">
            <div className="h-full bg-hsl-l100 dark:bg-hsl-l25 border-hsl-l80 pointer-events-none border-2 border-dashed flex flex-col justify-center items-center p-2">
              {!localFile ? (
                <>
                  <IconGeneral type='upload' size={30} />
                  <label htmlFor="uploadFile" className='pointer-events-none'>
                    Choose <strong>File</strong> or drag it here.
                  </label>
                </>
              ) : (
                <div className="flex flex-col justify-center items-center">
                  <p className="text-hsl-l50">File Uploaded!</p>
                  <p>{localFile?.name}</p>
                </div>
              )}

              <input type="file" id="uploadFile" name="uploadFile"
                className='absolute opacity-0 cursor-pointer h-full w-full inset-0 pointer-events-auto '
                onChange={(e) => handleFileUpload(e)} ref={fileInputRef} />
            </div>

            {localFile && (
              <div className="absolute -top-8 -right-8" title='Remove File'>
                <button type="button" onClick={handleFileRemove} className="bg-red-500 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-900 p-2 rounded-full">
                  <IconGeneral type="delete" size={20} className='fill-white dark:fill-white' />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoadMaster;