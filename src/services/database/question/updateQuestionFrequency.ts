import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * Update Question Frequency in Firestore
 * @param questionId - The ID of the question to update
 * @param isCompetitor - Boolean indicating if the question is from the competitor collection
 * @param change - +1 for incrementing, -1 for decrementing
 */
export default async function updateQuestionFrequency(questionId: string, isCompetitor: boolean = false, change: number) {
  try {
    const collectionName = isCompetitor ? "#_CompetitorCollection" : "#_MasterCollection";
    const questionDocRef = doc(db, collectionName, questionId);

    // Check if the document exists before updating
    const docSnap = await getDoc(questionDocRef);

    // Increment or decrement the frequency field based on the `change` value
    if (docSnap.exists()) {
      await updateDoc(questionDocRef, {
        frequency: increment(change),
      });
    } else {
      console.log(`Question ID: ${questionId} not found in ${collectionName}`);
    }

  } catch (error) {
    console.error(`Error updating frequency for question: ${questionId}`, error);
  }
};