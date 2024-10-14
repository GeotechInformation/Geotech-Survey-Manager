import * as dfd from 'danfojs';

/**
 * Fill Na Survey Columns
 * @param surveyData 
 * @returns 
 */
const fillNaSurveyColumns = (surveyData: dfd.DataFrame) => {
  try {
    if (!surveyData) throw new Error("Fill Na Survey Columns: Survey data not defined");

    // Create DataFrame from the surveyData
    const data = surveyData.copy()

    // Extract the first and second rows
    const columnNames = data.columns as any[];
    const secondRow = data.iloc({ rows: [0] }).values[0] as any[];
    const updatedColumnNames = columnNames.map((val, idx) => typeof val === 'string' && val.startsWith('__EMPTY') ? secondRow[idx] : val);

    // Create a new DataFrame with the updated first row as column names
    const newColumnNames = updatedColumnNames;
    const newSurveyData = new dfd.DataFrame(data.values, { columns: newColumnNames });
    newSurveyData.drop({ index: [0], inplace: true });

    return newSurveyData;
  } catch (error) {
    throw error;
  }
};

export default fillNaSurveyColumns;