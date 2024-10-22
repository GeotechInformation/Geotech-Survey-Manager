import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { Question } from "@/types/Question";
import { db } from "../../firebaseConfig";

/**
 * Migrate Questions from Old Collection to New Collection
 */
export default async function renameCollection(): Promise<void> {
  try {
    // Reference to the old and new collections
    const oldCollectionRef = collection(db, "MasterSurveyCollection");
    const newCollectionRef = collection(db, "#_MasterCollection");

    // Get all documents from the old collection
    const querySnapshot = await getDocs(oldCollectionRef);

    // Log how many documents are being migrated
    console.log(`Migrating ${querySnapshot.size} documents from MasterSurveyCollection to #_MasterCollection.`);

    // Iterate over the questions and migrate them to the new collection
    const migrationPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const questionData = docSnapshot.data() as Question;

      // Create a document in the new collection with the same ID
      const newDocRef = doc(newCollectionRef, docSnapshot.id);
      await setDoc(newDocRef, questionData); // Migrate the document to the new collection

      // Log each migrated document ID
      console.log(`Migrated document with ID: ${docSnapshot.id}`);
    });

    // Wait for all documents to be migrated
    await Promise.all(migrationPromises);

    // Log completion
    console.log('Migration complete.');
  } catch (error) {
    console.error("Error migrating questions: ", error);
  }
}
