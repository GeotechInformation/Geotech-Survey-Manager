import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Fetch question IDs for a given survey type from #_SurveyTemplates collection
 * @param surveyType 
 * @returns array of question IDs
 */
export default async function getQuestionIdsForSurveyType(surveyType: string): Promise<string[]> {
  try {
    const surveyTypeRef = doc(db, "#_SurveyTemplates", surveyType);
    const surveyTypeDoc = await getDoc(surveyTypeRef);

    if (!surveyTypeDoc.exists()) {
      throw new Error(`Survey type '${surveyType}' not found`);
    }

    return surveyTypeDoc.data()?.questionIds as string[];
  } catch (error) {
    console.error("Error fetching question IDs:", error);
    throw error;
  }
};
