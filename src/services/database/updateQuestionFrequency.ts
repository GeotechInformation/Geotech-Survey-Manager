import { doc, increment, updateDoc } from "firebase/firestore";
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

    // Increment or decrement the frequency field based on the `change` value
    await updateDoc(questionDocRef, {
      frequency: increment(change),
    });

  } catch (error) {
    console.error(`Error updating frequency for question: ${questionId}`, error);
  }
};