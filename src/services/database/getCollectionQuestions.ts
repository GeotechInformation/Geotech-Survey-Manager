import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Status } from "@/types/Status";
import { Question } from "@/types/Question";

/**
 * Get Collection Questions
 * @param surveyName 
 * @returns 
 */
export default async function getCollectionQuestions(surveyName: string): Promise<Status | Question[]> {
  try {
    const collectionRef = collection(db, surveyName);
    const querySnapshot = await getDocs(collectionRef);

    if (querySnapshot.empty) {
      return { success: false, message: 'Survey Name is not valid' } as Status;
    }

    const questions: Question[] = [];

    querySnapshot.forEach((doc) => {
      questions.push(doc.data() as Question);
    });

    // Sort the questions array by the `index` property
    const sortedQuestions = questions.sort((a, b) => a.index - b.index);

    return sortedQuestions;
  } catch (error) {
    throw error;
  }
}