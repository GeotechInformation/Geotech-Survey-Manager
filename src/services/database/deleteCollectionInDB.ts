import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import updateQuestionFrequency from "./updateQuestionFrequency";

/**
 * Recursively delete all documents in a collection and update frequency in Master/Competitor collections.
 * @param collectionName - The path to the collection to be deleted
 */
const deleteCollectionAndUpdateFrequency = async (collectionName: string) => {
  try {
    // Get all documents in the collection
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log("No documents found in the collection.");
      return;
    }

    // Iterate over each document in the collection
    for (const docSnap of snapshot.docs) {
      const docId = docSnap.id; // Get the document/question ID

      // Delete the document
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`Deleted document: ${docId}`);

      // Now, decrement the frequency in both #_MasterCollection and #_CompetitorCollection
      await updateQuestionFrequency(docId, false, -1); // Update frequency in #_MasterCollection
      await updateQuestionFrequency(docId, true, -1);  // Update frequency in #_CompetitorCollection
    }

    console.log(`Successfully deleted collection: ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting collection: ${collectionName}`, error);
  }
};

export default deleteCollectionAndUpdateFrequency;
