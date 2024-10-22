import { collection, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Remove surveyType field from all questions
 */
export const removeSurveyTypeFromMasterCollection = async () => {
  try {
    // Reference to the #_MasterCollection
    const masterCollectionRef = collection(db, "Soonta");
    const masterDocsSnapshot = await getDocs(masterCollectionRef);

    // Loop through each document in the collection
    for (const questionDoc of masterDocsSnapshot.docs) {
      const questionRef = doc(db, "Soonta", questionDoc.id);

      // Update the document to remove the surveyType field
      await updateDoc(questionRef, {
        surveyType: deleteField()
      });

      console.log(`Removed surveyType from question: ${questionDoc.id}`);
    }

    console.log("Successfully removed surveyType from all questions.");
  } catch (error) {
    console.error("Error removing surveyType from questions:", error);
  }
};
