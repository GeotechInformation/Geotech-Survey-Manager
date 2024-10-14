import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { CollectionMetadata } from "@/types/CollectionMetadata";
import { Question } from "@/types/Question";


/**
 * Save Collection In DB
 * @param questions 
 * @param collectionName 
 * @param collectionMetadata 
 */
export default async function saveCollectionInDB(questions: Question[], collectionMetadata: CollectionMetadata) {
  try {
    const collectionRef = collection(db, collectionMetadata.name);

    // Clear existing documents in the collection
    const existingDocs = await getDocs(collectionRef);
    await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)));

    // Save metadata to the #_Metadata collection with the document ID as collectionMetadata.name
    const metadataCollectionRef = collection(db, "#_Metadata");
    const metadataDocRef = doc(metadataCollectionRef, collectionMetadata.name);
    await setDoc(metadataDocRef, collectionMetadata);

    // Save each question as a separate document
    await Promise.all(
      questions.map((question) => setDoc(doc(collectionRef, question.id), question))
    );
  } catch (error) {
    throw error;
  }
}