import * as dfd from "danfojs";
import { Question } from "@/types/Question";
import { Status } from "@/types/Status";
import getCollectionQuestions from "../database/getCollectionQuestions";


/**
 * Build Metadata for the raw data.
 * 
 * Combines survey metadata from Firestore with existing metadata in the given DataFrame,
 * and adds specific competitors to the metadata. Finally, returns the resulting metadata.
 * 
 * @param metadata - The initial metadata DataFrame to be updated.
 * @param surveyNameFirestore - The Firestore collection name for fetching survey questions.
 * @param rawData - The raw data DataFrame to identify specific variables.
 * @returns A DataFrame containing the updated metadata.
 */
const buildMetadata = async (metadata: dfd.DataFrame, surveyNameFirestore: string, competitorVariables: string[]): Promise<dfd.DataFrame> => {
  try {
    let metadataCopy = metadata.copy();  // Create a deep copy of metadata

    // Get the question Data
    if (!surveyNameFirestore || surveyNameFirestore.length <= 0) throw new Error("Survey Name is not valid");
    const response: Status | Question[] = await getCollectionQuestions(surveyNameFirestore);
    // Check if response is an error status
    if ('success' in response && !response.success) {
      throw new Error(response.message || 'Unable to get survey collection from database');
    }
    // Question Database QDB
    const qdb: Question[] = response as Question[];

    // Create metadata
    const surveyMetadata = qdb.map(question => ({
      Variable: question.id,
      Heading: question.question,
      Category: question.category,
      FormatColor: question.color
    }));

    // Convert surveyMetadata to a Danfo DataFrame
    const dfSurveyMetadata = new dfd.DataFrame(surveyMetadata);

    // Combine existing metadata with survey metadata
    const combinedMetadata = dfd.concat({ dfList: [metadataCopy, dfSurveyMetadata], axis: 0 }) as dfd.DataFrame;

    // Create competitor metadata
    const competitorMetadata = competitorVariables.map(variable => ({
      Variable: variable,
      Heading: variable,
      Category: 'Competition',
      FormatColor: 'FFFFCCCC'
    }));
    const dfCompetitorMetadata = new dfd.DataFrame(competitorMetadata);

    // Combine all metadata
    const combinedMetadataAll = dfd.concat({ dfList: [combinedMetadata, dfCompetitorMetadata], axis: 0 }) as dfd.DataFrame;

    // Return the combined metadata DataFrame
    return combinedMetadataAll.resetIndex();

  } catch (error) {
    console.error("Error building metadata:", error);
    throw error;
  }
};

export default buildMetadata;