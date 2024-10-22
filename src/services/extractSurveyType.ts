import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Extract Survey Type IDs from #_MasterCollection and save to Firestore
 */
export const extractSurveyTypeIDs = async () => {
  try {
    // Reference to the #_MasterCollection
    const masterCollectionRef = collection(db, "#_MasterCollection");
    const masterDocsSnapshot = await getDocs(masterCollectionRef);

    // Initialize an object to store question IDs by survey type
    const surveyTypes: Record<string, string[]> = {
      freeStand: [],
      foodPrecinct: [],
      shoppingCentre: [],
      strip: []
    };

    // Loop through each question in #_MasterCollection and categorize by surveyType
    masterDocsSnapshot.forEach((doc) => {
      const question = doc.data();

      if (question.surveyType?.freeStand) {
        surveyTypes.freeStand.push(question.id);
      }
      if (question.surveyType?.foodPrecinct) {
        surveyTypes.foodPrecinct.push(question.id);
      }
      if (question.surveyType?.shoppingCentre) {
        surveyTypes.shoppingCentre.push(question.id);
      }
      if (question.surveyType?.strip) {
        surveyTypes.strip.push(question.id);
      }
    });

    // Save the categorized question IDs to Firestore under the surveyTypes collection
    const surveyTypesCollectionRef = collection(db, "#_SurveyTemplates");

    // Loop through each survey type and save the question IDs
    for (const [surveyType, questionIds] of Object.entries(surveyTypes)) {
      const surveyTypeDocRef = doc(surveyTypesCollectionRef, surveyType);
      await setDoc(surveyTypeDocRef, { name: surveyType, questionIds });
    }

    console.log("Survey type IDs successfully saved to Firestore.");

  } catch (error) {
    console.error("Error extracting survey type IDs:", error);
  }
};
