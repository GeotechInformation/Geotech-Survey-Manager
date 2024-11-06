import ExcelJS, { DataValidationOperator, Workbook, Worksheet, } from 'exceljs';
import { Question } from '@/types/Question';
import { CollectionMetadata } from '@/types/CollectionMetadata';

type SiteDataRow = {
  [columnNumber: number]: string | number | null;
};

interface CommentText {
  font?: {
    name: string;
    size: number;
    bold: boolean;
  };
  text: string;
}

/**
 * Build Excel
 * @param {Question} questions 
 * @param {SiteDataRow} siteData 
 */
export default function generateExcelSurvey(questions: Question[], metadata: CollectionMetadata, siteData: SiteDataRow[] | null = null) {
  // Set Up Constants for Indexing
  const surveyerInputRow = 3; // Where to begin input for sites
  let surveySiteNumber = Array.isArray(siteData) && siteData.length > 0 ? siteData.length + 5 : 50

  try {
    // Create a new ExcelJS workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Survey');

    setUpWorksheet(questions, worksheet);
    handleDataValidation(questions, worksheet, surveyerInputRow, surveySiteNumber);
    applyConditionalFormmating(questions, worksheet, surveyerInputRow, surveySiteNumber);
    insertQuestionComment(questions, worksheet);
    if (siteData) { addSiteData(siteData, worksheet) };
    applyStyling(questions, worksheet);
    generateExcelFile(workbook, metadata.name);
  } catch (error) {
    throw error;
  }
}

/**
 * || Set Up Worksheet
 * @param {*} questions 
 * @param {*} worksheet 
 */
function setUpWorksheet(questions: Question[], worksheet: Worksheet) {
  try {
    // Add data to the worksheet
    worksheet.columns = questions.map(item => ({
      header: item.id, // Use the ID as the heading
      key: item.id, // Use the ID as the key
      width: 15, // Roughly 110px
    }));

    // Add questions as rows and set text wrap for question cells
    const questionRow = questions.map(item => item.question);
    worksheet.addRow(questionRow);
  } catch (error) {
    console.error("Error Setting Up Worksheet.");
    throw error;
  }
}


/**
 * || Data Validation
 * @param {*} questions 
 * @param {*} worksheet 
 * @param {*} startRow 
 * @param {*} endRow 
 */
function handleDataValidation(questions: Question[], worksheet: Worksheet, startRow: number, endRow: number) {
  try {
    // Potential Reponse : Any | List | YesNo | # | 0 to 3 | 1 to 3 | 1 to 5 
    questions.forEach((question, index) => {
      for (let i = startRow; i <= endRow; i++) {

        let type: "list" | "whole" | "decimal" | "date" | "textLength" | "custom" = "custom";
        let operator: DataValidationOperator | undefined = undefined;
        let promptTitle = '';
        let prompt = '';

        if (question.responseType === 'YesNo') {
          type = 'whole';
          operator = 'between';
          promptTitle = 'Yes / No';
          prompt = '[1 / 0]';
        }

        if (question.responseType === 'Number') {
          type = 'decimal';
          operator = 'between';
          promptTitle = 'Enter:';
          prompt = 'Any Number';
        }

        if (question.responseType === 'MinMax') {
          type = 'whole';
          operator = 'between';
          promptTitle = 'Enter:';
          prompt = '[' + question.validBounds.min + ' to ' + question.validBounds.max + ']';
        }

        if (question.responseType === 'YesNo' || question.responseType === 'MinMax') {
          worksheet.getCell(i, index + 1).dataValidation = {
            type: type,
            operator: operator,
            allowBlank: true,
            formulae: [question.validBounds.min, question.validBounds.max],

            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: 'Invalid Argument',
            error: 'Enter a number between ' + question.validBounds.min + ' and ' + question.validBounds.max,

            showInputMessage: true,
            promptTitle: promptTitle,
            prompt: prompt
          };
        }

        if (question.responseType === 'List') {
          const list = question.validBounds.options.replace(/;/g, ',');
          worksheet.getCell(i, index + 1).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${list}"`],

            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: 'Invalid Argument',
            error: 'Enter a value from the dropdown list',
          };
        }
      }
    });

  } catch (error) {
    console.error("Error Handling Data Validation.");
    throw error;
  }
}

/**
 * || Conditional Formatting
 * @param {*} questions 
 * @param {*} worksheet 
 * @param {*} startRow 
 * @param {*} endRow 
 */
function applyConditionalFormmating(questions: Question[], worksheet: Worksheet, startRow: number, endRow: number) {
  try {
    questions.forEach((question, index) => {
      const formatStart = excelCoords(startRow, index + 1);
      const formatEnd = excelCoords(endRow, index + 1);

      if (question.id.slice(0, 3) !== 'INF' && question.id.slice(0, 3) !== 'GEO') { // Dont format site data
        worksheet.addConditionalFormatting({
          ref: `${formatStart}:${formatEnd}`,
          rules: [{
            type: "cellIs",
            priority: 1,
            operator: 'equal',
            formulae: ['""'],
            style: {
              // fill: { type: 'none' },
            },
          },
          {
            type: "cellIs",
            priority: 3,
            operator: 'greaterThan',
            formulae: [0],
            style: {
              fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFCCFFCC' } } // Green
            },
          },
          {
            type: "expression",
            priority: 4,
            formulae: [`AND(ISNUMBER(${formatStart}), ${formatStart}=0)`],
            style: {
              fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFFFCC' } } // Yellow
            },
          }],
        });

        // Add Yellow for Yes No Q's
        if (question.responseType === 'YesNo') {
          worksheet.addConditionalFormatting({
            ref: `${formatStart}:${formatEnd}`,
            rules: [{
              type: "expression",
              priority: 2,
              formulae: [`AND(ISNUMBER(${formatStart}), ${formatStart}=0)`],
              style: {
                fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFFFCC' } } // Yellow
              },
            }]
          });
        }
      }
    });
  } catch (error) {
    console.error("Error Applying Conditional Formating.");
    throw error;
  }
}

/**
 * || Insert Question Comments
 * @param questions - Array of question objects
 * @param worksheet - Worksheet to insert the comments into
 */
function insertQuestionComment(questions: Question[], worksheet: Worksheet): void {
  try {
    questions.forEach((question, index) => {
      if (question.comment) {
        const comment = parseComment(question.comment);

        worksheet.getCell(2, index + 1).note = {
          texts: comment, // Already parsed, no need for eval
          margins: {
            insetmode: 'custom',
            inset: [0, 0, 0, 0],
          },
        };
      }
    });
  } catch (error) {
    console.error("Error Inserting Question Comments.", error);
    throw error;
  }
}


/**
 * || Add Site Data
 * Sorts the store list data in ascending order based on GEO_ID
 * Uses Parrallel appending to turn question objects in to arrays that represent survey column data
 * Finds the correct header in the survey and then maps the array to the column, appending data
 * @param {*} questions 
 * @param {*} worksheet 
 */
function addSiteData(siteData: SiteDataRow[], worksheet: Worksheet): void {
  try {
    if (Array.isArray(siteData) && siteData.length > 0) {
      // Find Index of Columns based on Mapping Headers
      const geoIdIdx = Object.values(siteData[0]).indexOf('GEO_ID');
      const storeNameIdx = Object.values(siteData[0]).indexOf('STORE_NAME');
      const addrIdx = Object.values(siteData[0]).indexOf('ADDRESS');
      const suburbIdx = Object.values(siteData[0]).indexOf('SUBURB');
      const postcodeIdx = Object.values(siteData[0]).indexOf('POSTCODE');
      const stateIdx = Object.values(siteData[0]).indexOf('ST');

      // Sort the array of row objects
      if (geoIdIdx !== -1) {
        const headerRow = siteData.shift(); // Remove and store the header row

        // Sort the array of row objects based on geoId
        siteData.sort((a, b) => {
          const geoIdA = parseInt(a[geoIdIdx + 1] as string); // Adding 1 because index is 0-based
          const geoIdB = parseInt(b[geoIdIdx + 1] as string);

          // Ignore non-numeric or missing geoId values
          if (isNaN(geoIdA) || isNaN(geoIdB)) {
            return 0;
          }

          return geoIdA - geoIdB;
        });

        // Reinsert the header row at the beginning of the array
        // Reinsert the header row at the beginning of the array
        if (headerRow) {
          siteData.unshift(headerRow);
        }
      } else {
        console.error('Header "GEO_ID" not found.');
        throw new Error("Cannot order site list based on GEO_ID");
      }


      // Parralel Append Data
      // Iterate through each row object and push values into corresponding arrays
      const geoId: (string | number | null)[] = [],
        storeName: (string | number | null)[] = [],
        addr: (string | number | null)[] = [],
        suburb: (string | number | null)[] = [],
        postcode: (string | number | null)[] = [],
        state: (string | number | null)[] = [];

      for (let i = 0; i < siteData.length; i++) {
        const rowObject = siteData[i];
        geoId.push(rowObject[geoIdIdx + 1]);
        if (rowObject[storeNameIdx + 1] == null) {  // Push Suburb if Store Name is Null
          storeName.push(rowObject[suburbIdx + 1]);
          console.log(`Appending Suburb '${rowObject[suburbIdx + 1]}' as Store Name for Site Data with ID`);
        } else {
          storeName.push(rowObject[storeNameIdx + 1]);
        }
        addr.push(rowObject[addrIdx + 1]);
        suburb.push(rowObject[suburbIdx + 1]);
        postcode.push(rowObject[postcodeIdx + 1]);
        state.push(rowObject[stateIdx + 1]);
      }


      // Define a mapping of headers to arrays
      const headerToArrayMap: { [key: string]: (string | number | null)[] } = {
        "GEO_ID": geoId, "INF001": storeName, "INF002": addr,
        "INF003": suburb, "INF004": postcode, "INF005": state
      };


      // Iterate through the surveyIdHeaders
      for (const surveySiteColumnHeader of Object.keys(headerToArrayMap)) {
        // Safely get row 1 and check if values exist
        const row = worksheet.getRow(1);
        const rowValues = row?.values as (string | null | undefined)[] | undefined; // Type assertion for safety

        if (!rowValues) {
          console.error('No values found in the first row.');
          continue; // Skip this iteration if row values are undefined
        }

        // Find the index of the column header in the values array
        const columnIndex = rowValues.indexOf(surveySiteColumnHeader);

        if (columnIndex >= 0) { // Ensure header exists
          const list = headerToArrayMap[surveySiteColumnHeader];

          if (list) {
            // Iterate over the array and append each value to the corresponding cell in the column
            for (let i = 1; i < list.length; i++) {
              const rowNumber = i + 2; // Starting from row 3
              const cell = worksheet.getCell(rowNumber, columnIndex);
              cell.value = list[i];
            }
          } else {
            console.error(`Array not found for header "${surveySiteColumnHeader}".`);
          }
        } else {
          console.error(`Header "${surveySiteColumnHeader}" not found.`);
        }
      }


    } else {
      console.error('No Site Data was Supplied');
    }
  } catch (error) {
    console.error("Error Adding Site Data. Error", error);
    throw error;
  }
}

/**
 * || Apply Styling
 * @param {*} worksheet 
 */
function applyStyling(questions: Question[], worksheet: Worksheet) {
  try {
    // Set Default Styling
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.font = { name: 'Montserrat Light', size: 8 };
      row.alignment = { vertical: 'middle', horizontal: 'center' };
      row.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } }, bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } }, right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      }
    })

    // ID Row Style
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell => {
      cell.font = { size: 6 }
    }));

    // Question Row Style
    worksheet.getRow(2).eachCell({ includeEmpty: true }, (cell => {
      cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
      cell.border = { bottom: { style: 'thick', color: { argb: 'D62222' } } }
    }));

    // Apply color to Question Row (Row 2)
    questions.forEach((question, index) => {
      worksheet.getCell(2, index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: question.color } };
    });
  } catch (error) {
    console.error("Error Applying Styling.");
    throw error;
  }
}

/**
 * Generate Excel File
 * @param {*} workbook 
 */
function generateExcelFile(workbook: Workbook, surveyName: string) {
  try {
    // Generate a blob from the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Create a Blob object from the buffer
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Survey_${surveyName}.xlsx`;
      a.click();
      // Clean up resources
      window.URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error("Error Generating Excel File.");
    throw error;
  }
}





/** ####################################################
 *                     Utility Functions
 *  ####################################################
 */


/**
 * Parse Comment
 * @param comment - The comment string to parse.
 * @returns Parsed comment as an array of objects with font properties and text.
 */
function parseComment(comment: string): CommentText[] {
  const trimmedComment = comment.trim();
  const lines = trimmedComment.split('_n').map(line => line.trim());
  const linesWithEscape = lines.map((line, index) => index < lines.length - 1 ? line + ' _n' : line);
  const result: CommentText[] = [];

  linesWithEscape.forEach(line => {
    const words = line.split(/[ \t]+/);

    words.forEach(word => {
      const boldRegex = /\*(.*?)\*/;
      const boldMatch = word.match(boldRegex);
      const newLineRegex = /_n/;

      if (boldMatch) {
        result.push({
          font: { name: 'Tahoma', size: 9, bold: true },
          text: boldMatch[1] + ' ',
        });
      } else if (newLineRegex.test(word)) {
        result.push({ text: '\n' });
      } else {
        result.push({
          font: { name: 'Tahoma', size: 9, bold: false },
          text: word + ' ',
        });
      }
    });
  });

  return result;
}

/**
 * Excel Coords
 * Convert numerical row and column to Excel Reference
 * @param {Number} row 
 * @param {Number} col 
 * @returns 
 */
function excelCoords(row: number, col: number) {
  var colStr = '';
  while (col > 0) {
    colStr = toChar((col - 1) % 26) + colStr;
    col = Math.floor((col - 1) / 26);
  }
  return colStr + row;
}

/**
 * To Char
 * Turns keyboard number in to character
 * @param {Number} n 
 * @returns String of Character based on Numeric
 */
function toChar(n: number) {
  const CAPITAL_A = 65;     // Constant - ASCII Keyboard Mapping
  return String.fromCharCode(CAPITAL_A + n);
}
