import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Question } from "@/types/Question";

/**
 * Edit Question
 * @param collectionName 
 * @param question 
 */
export default async function editQuestion(collectionName: string, question: Question) {
  try {
    const docRef = doc(collection(db, collectionName), question.id);

    await setDoc(docRef, question, { merge: true });
  } catch (error) {
    throw error;
  }
}