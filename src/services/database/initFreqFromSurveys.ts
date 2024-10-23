import { getDocs, getDoc, updateDoc, doc, collection, increment } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Initialize frequency for all questions in the master and competitor collections
 * based on existing surveys
 * @param surveyCollectionIds - Array of collection IDs (existing surveys)
 */
export default async function initializeFrequenciesFromSurveys(surveyCollectionIds: string[]) {
  try {
    // Iterate over each survey collection
    for (const surveyId of surveyCollectionIds) {
      const surveyCollectionRef = collection(db, surveyId);
      const surveySnapshot = await getDocs(surveyCollectionRef);

      // Iterate over each question in the survey
      for (const questionDoc of surveySnapshot.docs) {
        const questionId = questionDoc.id;

        // Try to increment frequency in the master collection
        const masterDocRef = doc(db, "#_MasterCollection", questionId);
        const masterDocSnapshot = await getDoc(masterDocRef);  // Use getDoc to retrieve document

        if (masterDocSnapshot.exists()) {
          // Increment frequency if the question exists in the master collection
          await updateDoc(masterDocRef, {
            frequency: increment(1),
          });
          console.log(`Incremented frequency for master question: ${questionId}`);
          continue; // No need to check competitor collection if found in master
        }

        // Try to increment frequency in the competitor collection
        const competitorDocRef = doc(db, "#_CompetitorCollection", questionId);
        const competitorDocSnapshot = await getDoc(competitorDocRef);  // Use getDoc to retrieve document

        if (competitorDocSnapshot.exists()) {
          // Increment frequency if the question exists in the competitor collection
          await updateDoc(competitorDocRef, {
            frequency: increment(1),
          });
          console.log(`Incremented frequency for competitor question: ${questionId}`);
        }
      }
    }

    console.log("Frequency initialization complete.");
  } catch (error) {
    console.error("Error initializing frequencies from surveys:", error);
  }
};
