import * as dfd from 'danfojs';

/**
 * Type definition for the columns to process.
 */
type ColumnProcessInfo = {
  col: string;
  prefix: string;
};

/**
 * Code Survey Dummies
 * @param surveyData - The input survey data as a DataFrame.
 * @returns The DataFrame with dummy variables added and original columns preserved.
 */
const codeSurveyDummies = (surveyData: dfd.DataFrame): dfd.DataFrame => {
  if (!surveyData) throw new Error("Code Survey Dummies: Survey data not defined");

  let data = surveyData.copy();

  // List of columns to process with their corresponding prefixes
  const columnsToProcess: ColumnProcessInfo[] = [
    { col: 'SIT001', prefix: 'StoreType' },
    { col: 'ACT001', prefix: 'PrecinctFocus' },
    { col: 'ACT002', prefix: 'PrimaryNature' }
  ];

  // Process the DataFrame and reorder the columns
  data = processAndReorderColumns(data, columnsToProcess);

  return data;
};

/**
 * Helper function to generate dummy variables and reorder columns.
 * @param df - The input DataFrame.
 * @param columnsToProcess - The columns to generate dummies for.
 * @returns The updated DataFrame with reordered columns.
 */
const processAndReorderColumns = (df: dfd.DataFrame, columnsToProcess: ColumnProcessInfo[]): dfd.DataFrame => {
  columnsToProcess.forEach(({ col, prefix }) => {
    if (df.columns.includes(col)) {
      // Store the initial column order
      const columnOrder: string[] = df.columns.slice();

      // Generate dummy variables
      const dfWithDummy = dfd.getDummies(df, { columns: [col], prefix: prefix });

      // Collect all new dummy columns
      const dummyColumns = dfWithDummy.columns.filter((column) => column.startsWith(prefix));

      // Add the dummy columns from dfWithDummy to the original DataFrame df
      dummyColumns.forEach((dummyCol) => {
        df.addColumn(dummyCol, dfWithDummy[dummyCol], { inplace: true });
      });

      // Reorder df to match the original column order plus the new dummy columns
      const newColumnOrder: string[] = [];

      // Iterate over the original column order and construct the new column order
      columnOrder.forEach((columnName) => {
        newColumnOrder.push(columnName); // Add columns not modified
        if (columnName === col) {
          newColumnOrder.push(...dummyColumns); // Add dummy columns after the original column
        }
      });

      // Reorder the DataFrame to match the new column order
      df = df.loc({ columns: newColumnOrder });

    } else {
      console.warn(`Cannot find column with ${col} as heading`);
    }
  });

  return df;
};

export default codeSurveyDummies;
