import { collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import updateQuestionFrequency from "./question/updateQuestionFrequency";
import getUserValue from "../utils/getUserValue";

/**
 * Recursively delete all documents in a collection and update frequency in Master/Competitor collections.
 * @param collectionName - The path to the collection to be deleted
 */
export default async function deleteCollectionInDB(collectionName: string) {
  try {

    // Enforce authenticated user
    if (!auth.currentUser) {
      return { success: false, message: 'No user detected. Login to post' };
    }

    const userId = auth.currentUser.uid;
    const userName = await getUserValue(userId, "userName");

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

    // Update Document from Metadata with Deleted Information
    const metadataDocRef = doc(db, "#_Metadata", collectionName);
    await updateDoc(metadataDocRef, {
      deleted: {
        deletedByUserName: userName,
        deletedByUserId: userId,
        deletedAt: serverTimestamp(),
      }
    });

    console.log(`Successfully deleted collection: ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting collection: ${collectionName}`, error);
  }
};
