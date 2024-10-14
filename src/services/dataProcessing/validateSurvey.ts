import * as dfd from 'danfojs';
import getCollectionQuestions from '../database/getCollectionQuestions';
import { Question } from '@/types/Question';
import { Status } from '@/types/Status';

/**
 * Validate Survey.
 * Compares the survey data against the data stored in the firestore database for validation
 * @param surveyData Datadframe containing processed survey data
 * @returns Array of string errors
 */
const validateSurvey = async (surveyData: dfd.DataFrame, surveyNameFirestore: string): Promise<string[]> => {
  try {
    if (!surveyData) throw new Error("Validate Survey: Survey data not defined");
    if (!surveyNameFirestore || surveyNameFirestore.length <= 0) throw new Error("Survey Name is not valid");

    const response: Status | Question[] = await getCollectionQuestions(surveyNameFirestore);

    // Check if response is an error status
    if ('success' in response && !response.success) {
      throw new Error(response.message || 'Unable to get survey collection from database');
    }

    // Question Database QDB
    const qdb: Question[] = response as Question[];

    // Array to collect validation errors
    const errors: string[] = [];

    // Loop through each column (which is a question) in the DataFrame
    surveyData.columns.forEach((column: string) => {
      // Find corresponding question in Firestore data using the id
      const question = qdb.find(q => q.id === column);
      if (!question) {
        errors.push(`Question with ID: "${column}" not found in database. This question wont't be validated`);
        return;
      }

      // Get the values for the current column
      const colValues = surveyData[column].values;

      // Validate each value based on the question's responseType
      colValues.forEach((value: any, index: number) => {
        switch (question.responseType) {
          case 'Number': // Validate number values based on min and max bounds
            if (value < question.validBounds.min || value > question.validBounds.max) {
              errors.push(`Invalid value for question "${question.question}" at row ${index + 1}: ${value} outside of Min/Max bound of ${question.validBounds.min}/${question.validBounds.max}`);
            }
            break;
          case 'List': // Assuming options are semi-comma-separated in question.validBounds.options
            const validOptions = question.validBounds.options.split(';').map(val => val.trim());
            if (!validOptions.includes(value)) {
              errors.push(`Invalid option for question "${question.question}" at row ${index + 1}: "${value}"`);
            }
            break;
          default:
            break;
        }
      });
    });


    // If errors were found, return them
    if (errors.length <= 0) {
      errors.push('No Errors!');
    }

    return errors;
  } catch (error) {
    throw error;
  }
};

export default validateSurvey;