import { OldQuestion, Question } from "@/types/Question";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Migrate the question documents to the new structure
 * @param collectionName - The name of the collection to update
 */
export default async function migrateQuestions(collectionName: string): Promise<void> {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    for (const docSnapshot of querySnapshot.docs) {
      const oldData = docSnapshot.data() as OldQuestion;

      // Remove extra double quotes from the comment
      const cleanComment = oldData.Comment ? oldData.Comment.replace(/^"|"$/g, '').trim() : '';

      // Transform data to new structure
      const min = parseFloat(oldData.Min);
      const max = parseFloat(oldData.Max);
      const isMaxValid = !isNaN(max);
      const isMinValid = !isNaN(min);

      // Transform data to new structure
      const newData: Partial<Question> = {
        id: oldData.ID,
        index: oldData.Index,
        question: oldData.Question,
        category: oldData.Category,
        color: oldData.Color,
        comment: cleanComment,
        responseType: oldData.ResponseType,
        validBounds: {
          min: isMaxValid ? min : 0,
          max: isMinValid ? max : 0,
          options: isMinValid ? '' : oldData.Min

        },
        surveyType: {
          freeStand: oldData.SurveyFS === 1,
          strip: oldData.SurveyStrip === 1,
          shoppingCentre: oldData.SurveySC === 1,
          foodPrecinct: oldData.SurveyFP === 1
        }
      };

      // Update document with new data using setDoc with merge option
      const docRef = doc(db, collectionName, docSnapshot.id);
      await setDoc(docRef, newData);

    }

    console.log(`Migration for collection ${collectionName} completed.`);
  } catch (error) {
    console.error(`Error migrating collection ${collectionName}:`, error);
  }
}