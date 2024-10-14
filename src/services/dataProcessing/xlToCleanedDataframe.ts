import * as dfd from 'danfojs';
import * as XLSX from 'xlsx';

/**
 * xl To Cleaned Dataframe
 * Converts xlsx to json to dataframe and removes empty columns
 * @param workbook 
 * @param sheetName 
 * @returns 
 */
export default function xlToCleanedDataframe(workbook: XLSX.WorkBook, sheetName: string) {
  // Convert the sheet to JSON format
  const sheetAsJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    raw: true,
    defval: "NaN" // Ensures empty cells are read
  });

  // Create a DataFrame from the JSON data
  const df = new dfd.DataFrame(sheetAsJson);

  // Filter out columns where the header is empty or starts with '__EMPTY' 
  const cleanedColumns = df.columns.filter(col => {
    if (col.startsWith('__EMPTY') || col.trim() === '') {
      // If the column has data, we keep it
      const hasData = df.loc({ columns: [col] }).values.flat().some(val => val !== '' && val !== null && val !== undefined);
      return hasData;
    }
    // Keep columns with non-empty headers
    return true;
  });

  // Return DataFrame with cleaned columns
  return df.loc({ columns: cleanedColumns });
}