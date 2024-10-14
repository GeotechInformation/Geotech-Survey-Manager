import * as dfd from "danfojs";
import { DataFrame } from "danfojs";
import buildMetadata from "./buildMetadata";



/**
 * Analyse Data.
 * 
 * @param allData 
 * @returns 
 */

/**
 * Analyse Data.
 * Builds metadata from combined survey from firestore and aio metadata tab.
 * Correlates variables with variance.
 * Calculates Triage.
 * Finds Missing Values
 * 
 * @param allData Combined AIO, Survey & Sales
 * @param metadataData Metadata from AIO file
 * @param surveyNameFirestore Survey Name for Firestore survey metadata
 * @returns 
 */
const analyseData = async (allData: DataFrame, metadataData: DataFrame, surveyNameFirestore: string): Promise<DataFrame[]> => {
  try {
    // Define the prefixes to include and exclude
    const includePrefixes = ["_N", "_1000", "_2000", "_3000", "_4000", "_5000"];
    const excludePrefixes = ["A_", "B_", "C_", "D_", "E_"]; // Already in MetdaData file

    // Filter columns based on inclusion and exclusion criteria
    const competitorVariables = allData.columns.filter(col => {
      const include = includePrefixes.some(prefix => col.endsWith(prefix));
      const exclude = excludePrefixes.some(prefix => col.startsWith(prefix));
      return include && !exclude;
    });

    // Build Metadata with firestore and metadata file
    const dfMetadata = await buildMetadata(metadataData, surveyNameFirestore, competitorVariables);

    // Correlate variables with sales
    const dfCorr = await correlateData(allData);
    const dfCorrMerged = dfd.merge({ left: dfCorr, right: dfMetadata, on: ['Variable'], how: 'left' });
    const dfCorrAll = dfCorrMerged.loc({ columns: ["Variable", "Heading", "Correlation", "ABS_Correlation"] });
    dfCorrAll.fillNa("NA", { inplace: true });
    dfCorrAll.sortValues("ABS_Correlation", { inplace: true, ascending: false });

    // Get Triage
    const dfTriage = calcTriage(dfCorrMerged);

    // Get Missing
    const dfMissing = findMissingValues(allData);

    return [dfMetadata, dfCorrAll, dfTriage, dfMissing];

  } catch (error) {
    throw error;
  }
};

export default analyseData;




/**
 * Correlate Data.
 * 
 * Correlates numerical data with sales.
 * Identifies columns with numerical data, removes columns with consistent values (no variation), 
 * and calculates the correlation between each numerical column and the 'Sales' column.
 * The resulting correlation values are stored in the self.corr_df DataFrame.
 * @param allData 
 * @returns 
 */
const correlateData = async (allData: DataFrame): Promise<DataFrame> => {
  try {
    const consistentCols: string[] = [];

    allData.columns.forEach((col: string) => {
      const series = allData[col];

      // Filter out "NaN" strings and undefined/null values
      const filteredSeries = series.values.filter((val: any) => val !== "NaN" && val !== undefined && val !== null && typeof val !== 'string');
      if (filteredSeries.length === 0) {
        consistentCols.push(col);
        return;
      }
      const seriesWithoutNaN = new dfd.Series(filteredSeries);

      // Get unique values from the filtered series
      const uniqueCount = seriesWithoutNaN.unique();
      if (uniqueCount.values.length === 1) {
        consistentCols.push(col);
      }
    });

    // Filter out consistent columns from the original DataFrame
    const rawDataWithVariance = allData.loc({ columns: allData.columns.filter((col: string) => !consistentCols.includes(col)) });

    // Calculate correlation with 'Sales' column
    const correlationData = rawDataWithVariance.columns.map(col => {
      // Calculate correlation between the current column and 'Sales'
      const correlation = calculateCorrelation(rawDataWithVariance[col], rawDataWithVariance['Sales']);
      return {
        Variable: col,
        Correlation: correlation,
        ABS_Correlation: Math.abs(correlation)
      };
    });

    // Create a DataFrame from the correlation data
    const corrDf = new dfd.DataFrame(correlationData, {
      columns: ['Variable', 'Correlation', 'ABS_Correlation']
    });

    return corrDf;
  } catch (error) {
    throw error;
  }
};


/**
 * Calculate Triage Data.
 *
 * This function separates the DataFrame into different categories, sorts each category by ABS_Correlation, 
 * and then concatenates the top 10 variables from each category into a single DataFrame.
 *
 * @param dfCorrMerged - The merged DataFrame containing correlation data.
 * @returns A DataFrame containing the top variables per category.
 */
const calcTriage = (dfCorrMerged: DataFrame): DataFrame => {
  const numberOfVars = 10;

  // Split into separate DataFrames by category
  const demographicDf = dfCorrMerged.query(dfCorrMerged['Category'].eq('Demographic')) as dfd.DataFrame;
  const generatorDf = dfCorrMerged.query(dfCorrMerged['Category'].eq('Generator')) as dfd.DataFrame;
  const siteDf = dfCorrMerged.query(dfCorrMerged['Category'].eq('Site')) as dfd.DataFrame;
  const competitionDf = dfCorrMerged.query(dfCorrMerged['Category'].eq('Competition')) as dfd.DataFrame;

  // Helper function to get top variables sorted by ABS_Correlation
  const getTopVariables = (df: DataFrame, numVars: number) => {
    return df.sortValues('ABS_Correlation', { ascending: false }).head(numVars);
  };

  // Get top 10 for each category sorted by ABS_Correlation
  const topDemographic = getTopVariables(demographicDf, numberOfVars);
  const topGenerator = getTopVariables(generatorDf, numberOfVars);
  const topSite = getTopVariables(siteDf, numberOfVars);
  const topCompetition = getTopVariables(competitionDf, numberOfVars);

  // Concatenate the top variables from each category
  let dfTriage = dfd.concat({ dfList: [topDemographic, topGenerator, topSite, topCompetition], axis: 0 }) as dfd.DataFrame;

  dfTriage = dfTriage.loc({ columns: ['Variable', 'Heading', 'Category', 'Correlation', 'ABS_Correlation'] });

  return dfTriage;
};



/**
 * Find Missing Values.
 * 
 * Finds columns with missing values in the input DataFrame.
 * Missing values include standard NaN, undefined, null, and the string "NaN".
 * @param allData - The input DataFrame to analyze.
 * @returns A DataFrame containing only columns with missing data.
 */
const findMissingValues = (allData: dfd.DataFrame): dfd.DataFrame => {
  const essentialColumns = ["GEO_ID", "INF001"];

  const missingColumns: string[] = allData.columns.filter((col: string) => {
    const isMissing = allData[col].isNa()    // Check for standard missing values (NaN, undefined, or null)
    const hasMissingValues = isMissing.values.includes(true);
    const hasNaNString = allData[col].values.includes("NaN");    // Check if the column contains the string "NaN"
    return hasMissingValues || hasNaNString;
  });

  // Add essential columns at the beginning if they are missing in the `missingColumns` array
  essentialColumns.forEach((col) => {
    if (!missingColumns.includes(col)) {
      missingColumns.unshift(col); // Adds the column at the beginning of the array
    }
  });

  // Create a new DataFrame containing only the columns with missing data
  const missingData = allData.loc({ columns: missingColumns });
  return missingData;
};


/**
 * Custom function to calculate the Pearson correlation between two Series.
 * 
 * @param series1 - The first Series.
 * @param series2 - The second Series.
 * @returns The correlation coefficient.
 */
const calculateCorrelation = (series1: dfd.Series, series2: dfd.Series): number => {
  const values1 = series1.values as number[];
  const values2 = series2.values as number[];

  if (values1.length !== values2.length) {
    throw new Error("Series must have the same length for correlation calculation.");
  }

  // Filter out missing values (undefined or null)
  const filteredData = values1.reduce<{ x: number[], y: number[] }>((acc, val, index) => {
    if (val !== undefined && val !== null && typeof val !== 'string' &&
      values2[index] !== undefined && values2[index] !== null && typeof values2[index] !== 'string') {
      acc.x.push(val);
      acc.y.push(values2[index]);
    }
    return acc;
  }, { x: [], y: [] });


  const filteredValues1 = filteredData.x;
  const filteredValues2 = filteredData.y;

  if (filteredValues1.length === 0 || filteredValues2.length === 0) {
    return 0; // No Correlation
  }

  const mean1 = filteredValues1.reduce((acc, val) => acc + val, 0) / filteredValues1.length;
  const mean2 = filteredValues2.reduce((acc, val) => acc + val, 0) / filteredValues2.length;

  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;

  for (let i = 0; i < filteredValues1.length; i++) {
    const diff1 = filteredValues1[i] - mean1;
    const diff2 = filteredValues2[i] - mean2;
    covariance += diff1 * diff2;
    variance1 += diff1 * diff1;
    variance2 += diff2 * diff2;
  }

  return covariance / Math.sqrt(variance1 * variance2);
};