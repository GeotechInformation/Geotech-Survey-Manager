import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { CollectionMetadata } from "@/types/CollectionMetadata";
import { Question } from "@/types/Question";
import getUserValue from "../utils/getUserValue";
import { Status } from "@/types/Status";


/**
 * Save Collection In DB
 * @param questions 
 * @param collectionName 
 * @param collectionMetadata 
 */
export default async function saveCollectionInDB(questions: Question[], collectionMetadata: CollectionMetadata): Promise<Status> {
  try {
    // Enforce authenticated user
    if (!auth.currentUser) {
      return { success: false, message: 'No user detected. Login to post' };
    }

    const userId = auth.currentUser.uid;
    const userName = await getUserValue(userId, "userName");

    const collectionRef = collection(db, collectionMetadata.name);

    // Clear existing documents in the collection
    const existingDocs = await getDocs(collectionRef);
    await Promise.all(existingDocs.docs.map(doc => deleteDoc(doc.ref)));

    // Save metadata to the #_Metadata collection with the document ID as collectionMetadata.name
    const metadataCollectionRef = collection(db, "#_Metadata");
    const metadataDocRef = doc(metadataCollectionRef, collectionMetadata.name);

    const updatedCollectionMetaData = {
      ...collectionMetadata,
      lastSaved: {
        time: Timestamp.now(),
        userId,
        userName,
      }
    };

    await setDoc(metadataDocRef, updatedCollectionMetaData);

    // Save each question as a separate document
    await Promise.all(
      questions.map((question) => setDoc(doc(collectionRef, question.id), question))
    );

    return { success: true, message: null };
  } catch (error) {
    throw error;
  }
}