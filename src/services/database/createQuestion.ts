import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Question } from "@/types/Question";

/**
 * Create Question
 * @param collectionName 
 * @param question 
 */
export default async function createQuestion(collectionName: string, question: Question) {
  try {
    const docRef = doc(collection(db, collectionName), question.id);

    await setDoc(docRef, question);
  } catch (error) {
    throw error;
  }
}