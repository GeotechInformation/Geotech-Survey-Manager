import { DataFrame, merge } from "danfojs";

/**
 * Merge data on GEO_ID from multiple data sources.
 * Replace empty or null values with empty parenthesis "" in survey / sales
 * @param aioData - The main DataFrame to merge into.
 * @param surveyData - The survey DataFrame to merge.
 * @param salesData - The sales DataFrame to merge.
 * @returns An object containing the merged DataFrame and any errors encountered.
 */
const mergeData = async (aioData: DataFrame, surveyData: DataFrame | null, salesData: DataFrame | null): Promise<{ df: DataFrame | null, errors: string[] }> => {
  const errors: string[] = [];
  let df: DataFrame | null = null;

  try {
    // Check if GEO_ID column exists and is not empty in AIO data
    if (!aioData.columns.includes("GEO_ID") || aioData["GEO_ID"].values.some((val: any) => val === null || val === undefined || val === "")) {
      errors.push('GEO_ID column does not exist or contains empty values in AIO data');
      return { df, errors };
    }

    // Set the initial DataFrame to AIO data
    df = aioData;

    // Merge with sales data if available
    if (salesData) {
      if (!salesData.columns.includes("GEO_ID")) {
        errors.push('GEO_ID column does not exist in Sales Data. Skipping sales merge.');
      } else if (salesData["GEO_ID"].values.every((val: any) => val === null || val === undefined || val === "")) {
        errors.push('GEO_ID column in Sales Data has no valid values. Skipping sales merge.');
      } else {
        // After merging, move specific columns to after 'STORE_NAME'
        df = merge({ left: df, right: salesData, on: ["GEO_ID"], how: "left" });

        // Get the index of 'STORE_NAME'
        const storeNameIndex = df.columns.indexOf('STORE_NAME');

        if (storeNameIndex === -1) {
          errors.push("'STORE_NAME' column not found in the DataFrame.")
          return { df: null, errors };
        }

        // List of columns that were added by the merge from salesData
        const salesColumns = salesData.columns.filter(col => col !== 'GEO_ID');

        // Remove these columns from their current position in the DataFrame
        const reorderedColumns = df.columns.filter(col => !salesColumns.includes(col));

        // Insert sales columns right after 'STORE_NAME'
        const finalColumnOrder = [
          ...reorderedColumns.slice(0, storeNameIndex + 1), // Columns up to and including 'STORE_NAME'
          ...salesColumns, // Insert sales columns here
          ...reorderedColumns.slice(storeNameIndex + 1) // Remaining columns after 'STORE_NAME'
        ];

        // Reorder the DataFrame to match the new column order
        df = df.loc({ columns: finalColumnOrder });
      }
    } else {
      errors.push('No Sales Data. Skipping sales merge.');
    }


    // Merge with survey data if available
    if (surveyData) {
      if (!surveyData.columns.includes("GEO_ID")) {
        errors.push('GEO_ID column does not exist in Survey Data. Skipping survey merge.');
      } else if (surveyData["GEO_ID"].values.every((val: any) => val === null || val === undefined || val === "")) {
        errors.push('GEO_ID column in Survey Data has no valid values. Skipping sales merge.');
      } else {
        df = merge({ left: df, right: surveyData, on: ["GEO_ID"], how: "left" });
      }
    } else {
      errors.push('No Survey Data. Skipping survey merge.');
    }


    // Convert NaN values to "Nan"
    df.fillNa("NaN", { inplace: true });

    if (errors.length <= 0) {
      errors.push('No Errors!');
    }

    return { df, errors };

  } catch (error) {
    throw error;
  }
};

export default mergeData;
