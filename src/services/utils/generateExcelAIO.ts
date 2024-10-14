import * as dfd from 'danfojs';
import ExcelJS, { Workbook, Worksheet } from 'exceljs';

/**
 * Generate Excel
 * @param allData - The data in the form of a Danfo.js DataFrame to be written to the Excel file.
 * @returns A Promise that resolves when the Excel file generation and download are complete.
 */
export default async function generateExcelAIO(allData: dfd.DataFrame, metadata: dfd.DataFrame): Promise<string[]> {
  const errors: string[] = []
  try {
    // Create a new workbook and add a worksheet
    const workbook = createWorkbookFromDataFrame(allData);
    applyFormat(workbook, metadata, errors);
    convertHeading(workbook, metadata);
    await generateExcelFile(workbook);

    return errors;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw error;
  }
}


/**
 * Converts a Danfo.js DataFrame to an Excel workbook.
 * @param {dfd.DataFrame} allData - The Danfo.js DataFrame to convert.
 * @param {string} sheetName - The name of the Excel sheet to create.
 * @returns {ExcelJS.Workbook} The generated Excel workbook.
 */
function createWorkbookFromDataFrame(allData: dfd.DataFrame, sheetName: string = 'AIO'): ExcelJS.Workbook {
  // Create a new workbook and add a worksheet
  const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
  const worksheet: ExcelJS.Worksheet = workbook.addWorksheet(sheetName);

  // Convert the Danfo.js DataFrame to an array of objects
  const dataArray: any[] = dfd.toJSON(allData) as any[];
  const headerArray: string[] = Object.keys(dataArray[0]);

  // Replace 'NaN' and empty strings with null
  const processedDataArray: (string | number | boolean | null)[][] = dataArray.map((row: any) =>
    headerArray.map((key: string) => {
      const cell = row[key];
      return (cell === "NaN" || cell === "" || cell === undefined) ? null : cell;
    })
  );

  // Add processed data rows to the worksheet
  worksheet.addRow(headerArray);
  processedDataArray.forEach((row: (string | number | boolean | null)[]) => {
    worksheet.addRow(row);
  });

  return workbook;
}


/**
 * Converts the header row in the first worksheet of the given workbook using the provided metadata.
 * It only replaces column names where there is a variable match; otherwise, it keeps the original column name.
 * @param {ExcelJS.Workbook} workbook - The ExcelJS workbook containing the worksheet to update.
 * @param {dfd.DataFrame} metadata - The metadata DataFrame containing `Variable` and `Heading` columns.
 */
function convertHeading(workbook: ExcelJS.Workbook, metadata: dfd.DataFrame): void {
  // Get the first worksheet in the workbook
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheet found in the workbook.');
  }

  // Create a mapping object from metadata
  const metaDataMap: { [key: string]: string } = {};
  metadata.values.forEach((row: any) => {
    const variable = row[0] as string;
    const heading = row[1] as string;
    metaDataMap[variable] = heading;
  });

  // Get the header row (first row) in the worksheet
  const headerRow = worksheet.getRow(1);

  // Update each cell in the header row based on the metadata mapping
  headerRow.eachCell((cell, colNumber) => {
    const originalHeader = cell.value as string;
    // Only replace if there's a matching variable in the metadata map
    if (metaDataMap[originalHeader]) {
      cell.value = metaDataMap[originalHeader];
    }
  });

  // Commit the changes to the header row
  headerRow.commit();
}



/**
 * Applies formatting to the first worksheet in the given workbook based on the formats DataFrame.
 * @param {ExcelJS.Workbook} workbook - The ExcelJS workbook containing the worksheet to format.
 * @param {dfd.DataFrame} formats - The metadata DataFrame containing `Variable` and `FormatColor` columns.
 */
function applyFormat(workbook: ExcelJS.Workbook, formats: dfd.DataFrame, errors: string[]): void {
  // Get the first worksheet in the workbook
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheet found in the workbook.');
  }

  // Define the default font and alignment for all cells
  const defaultFont: Partial<ExcelJS.Font> = { name: 'Montserrat Light', size: 8 };
  const defaultAlignment: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center' };

  // Apply default styling to all cells
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = defaultFont;
      cell.alignment = defaultAlignment;
    });
  });

  // Apply formatting to the header row (row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const variable = cell.value as string;

    // Check if the cell value is a non-empty string and exists in the formats DataFrame
    if (typeof variable === 'string' && variable.trim() !== '' && !formats.isEmpty) {
      const variableIndex = formats['Variable'].values.indexOf(variable);

      if (variableIndex !== -1) {
        // Get the color value from the formats DataFrame
        const colorValue = formats.at(variableIndex, 'FormatColor') as string;

        // Define the fill style with the retrieved color
        const fillStyle: ExcelJS.Fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colorValue },
        };

        // Apply formatting to the header cell
        cell.font = defaultFont;
        cell.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };
        cell.fill = fillStyle;

      } else {
        errors.push(`Variable '${variable}' not found in formats. Skipping formatting.`);
      }
    }
  });

  // Commit the changes to the header row
  headerRow.commit();

  // Apply custom formatting to the "Sales" column
  let salesColumnIndex: number | undefined;
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    if (cell.value === 'Sales') {
      salesColumnIndex = colNumber;
    }
  });

  if (salesColumnIndex) {
    // Apply custom formatting to the "Sales" column
    const salesColumn = worksheet.getColumn(salesColumnIndex);
    salesColumn.eachCell((cell) => {
      if (typeof cell.value === 'number') {
        cell.numFmt = '$#,##0';
      }
    });
  } else {
    errors.push('Sales column not found in the worksheet.');
  }

  // Adjust column widths
  worksheet.columns.forEach((column) => {
    column.width = 17; // Set a default width (you can adjust this as needed)
  });
}






/**
 * Generate Excel File
 * @param workbook - The ExcelJS Workbook object that contains the data.
 * @returns A Promise that resolves when the Excel file download is triggered.
 */
async function generateExcelFile(workbook: Workbook): Promise<void> {
  try {
    // Generate a buffer from the workbook
    const buffer: ArrayBuffer = await workbook.xlsx.writeBuffer();

    // Create a Blob object from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AIO.xlsx';
    document.body.appendChild(a); // Append to the document body to ensure it is clickable
    a.click();

    // Clean up resources
    document.body.removeChild(a); // Remove the link after clicking
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error Generating Excel File:", error);
    throw error;
  }
}
