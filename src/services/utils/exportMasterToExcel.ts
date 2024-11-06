import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as XLSX from "xlsx";
import { Question } from "@/types/Question";

/**
 * Export all questions from AAA_MasterCollection to an Excel file
 */
export default async function exportMasterToExcel() {
  try {
    // Reference to the AAA_MasterCollection
    const collectionRef = collection(db, "AAA_MasterCollection");

    // Fetch all documents in the collection
    const querySnapshot = await getDocs(collectionRef);

    if (querySnapshot.empty) {
      console.log("No documents found in AAA_MasterCollection.");
      return;
    }

    // Map documents to an array of question objects
    const questions = querySnapshot.docs.map((doc) => doc.data() as Question);

    // Convert questions to a 2D array format compatible with Excel
    const data = questions.map((question) => ({
      id: question.id,
      index: question.index,
      question: question.question,
      category: question.category,
      color: question.color,
      comment: question.comment,
      responseType: question.responseType,
      minBound: question.validBounds.min,
      maxBound: question.validBounds.max,
      options: question.validBounds.options,
      frequency: question.frequency ?? 0,
    }));

    // Convert the data array to an Excel worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, "AAA_MasterCollection_Questions.xlsx");
  } catch (error) {
    throw error;
  }
}
