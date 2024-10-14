import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * Check Survey Name Exists
 * @param surveyName 
 * @returns 
 */
export default async function checkSurveyNameExistsInB(surveyName: string): Promise<boolean> {
  try {
    const collectionRef = collection(db, surveyName);
    const querySnapshot = await getDocs(collectionRef);

    if (querySnapshot.empty) return false

    return true;
  } catch (error) {
    throw error;
  }
}