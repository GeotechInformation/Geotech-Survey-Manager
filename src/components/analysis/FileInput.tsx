// File Input tsx

"use client";

import * as XLSX from 'xlsx';
import { useRef, useState } from 'react';
import { useAnalysisDataContext } from '../providers/AnalysisDataProvider';
import { useNotification } from '../providers/NotificationProvider';
import IconGeneral from '../icons/IconGeneral';
import { codeSurveyDummies, fillNaSurveyColumns, xlToCleanedDataframe } from '@/services';

type FileType = 'aio' | 'sales' | 'survey';

interface FileInputProps {
  fileType: FileType;
}

const FileInput: React.FC<FileInputProps> = ({ fileType }) => {
  const { setAioData, setAioHeadings, setCompData, setMetadataData, setSalesData, setSurveyData } = useAnalysisDataContext();
  const { addNotification } = useNotification();
  const [localFile, setLocalFile] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Label mapping using enum
  const labels: { [key in FileType]: string } = {
    aio: 'AIO File',
    sales: 'Sales File',
    survey: 'Survey File',
  };

  const label = labels[fileType] || 'Unknown File Type';

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
        // Read the Excel file using xlsx
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });

        // Get sheet names
        const sheetNames = workbook.SheetNames;

        if (fileType === 'aio') {
          // Read sheets for 'aio'
          const aioSheet = sheetNames.find(name => name === 'AIO_Data');
          const compSheet = sheetNames.find(name => name === 'Comp');
          const metadataSheet = sheetNames.find(name => name === 'Metadata');

          if (!aioSheet) {
            addNotification("Unable to find 'AIO_Data' sheet", 'error');
            console.error('File does not contained sheet called "AIO_Data"');
            handleFileRemove();
            return;
          }

          if (!compSheet) {
            addNotification("Unable to find 'Comp' sheet", 'error');
            console.error('File does not contained sheet called "Comp"');
            handleFileRemove();
            return;
          }

          if (!metadataSheet) {
            addNotification("Unable to find 'Metadata' sheet", 'error');
            console.error('File does not contained sheet called "Metadata"');
            handleFileRemove();
            return;
          }

          // Process AIO Sheet
          const dfAio = xlToCleanedDataframe(workbook, aioSheet);
          setAioData(dfAio);
          setAioHeadings(dfAio.columns);

          // Process Comp Data Sheet
          const dfComp = xlToCleanedDataframe(workbook, compSheet);
          setCompData(dfComp);

          // Process Metadata Data Sheet
          const dfMetadata = xlToCleanedDataframe(workbook, metadataSheet);
          setMetadataData(dfMetadata);

        } else if (fileType === 'sales') {
          // Read 'Sales' sheet
          const salesSheet = sheetNames.find(name => name === 'Sales');
          if (!salesSheet) {
            addNotification("Unable to find 'Sales' sheet", 'error');
            console.error('File does not contained sheet called "Sales"');
            handleFileRemove();
            return;
          }

          const df = xlToCleanedDataframe(workbook, salesSheet);
          setSalesData(df);

        } else if (fileType === 'survey') {
          // Read the first sheet
          if (sheetNames.length <= 0) {
            addNotification("Unable to find 'Survey' sheet", 'error');
            console.error('File does not contain a sheet');
            handleFileRemove();
            return;
          }
          const surveySheet = sheetNames[0];
          const df = xlToCleanedDataframe(workbook, surveySheet);
          const dfProcessed = fillNaSurveyColumns(df);
          const dfDummyCoded = codeSurveyDummies(dfProcessed);
          setSurveyData(dfDummyCoded);
        } else {
          // Cannot Read File
          addNotification('File Type Unknown', 'error');
          console.error('Filetype unknown. this is a component issue');
          handleFileRemove();
        }

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
    if (fileType === 'aio') {
      setAioData(null);
      setAioHeadings(null);
    }
    if (fileType === 'sales') setSalesData(null);
    if (fileType === 'survey') setSurveyData(null);

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full relative">

      <div className="bg-hsl-l95 dark:bg-hsl-l20 pointer-events-none w-full h-full rounded-lg p-4">
        <div className="h-full relative bg-hsl-l100 dark:bg-hsl-l25 border-hsl-l80 pointer-events-none border-2 border-dashed flex flex-col justify-center items-center p-4">

          {!localFile ? (
            <>
              <IconGeneral type='upload' size={30} />
              <label htmlFor={fileType} className='pointer-events-none'>
                Choose <strong>{label}</strong> or drag it here.
              </label>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <p className="text-hsl-l50">File Uploaded!</p>
              <p>{localFile?.name}</p>
            </div>
          )}

          <input type="file" id={fileType} name={fileType}
            className='absolute opacity-0 cursor-pointer h-full w-full inset-0 pointer-events-auto '
            onChange={(e) => handleFileUpload(e)} ref={fileInputRef} />
        </div>
      </div>

      {localFile && (
        <div className="absolute top-2 right-2" title='Remove File'>
          <button type="button" onClick={handleFileRemove} className="bg-red-500 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-900 p-2 rounded-full">
            <IconGeneral type="delete" size={20} className='fill-white dark:fill-white' />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileInput;