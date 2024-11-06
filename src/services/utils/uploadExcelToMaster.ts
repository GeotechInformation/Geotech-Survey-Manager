import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as XLSX from "xlsx";
import { Question } from "@/types/Question";

/**
 * Upload questions from an Excel file into a new Firestore collection.
 * @param file - The Excel file to upload.
 * @param newCollectionName - The name of the new Firestore collection.
 */
export default async function uploadExcelToMaster(file: File, newCollectionName: string) {
  try {
    console.log(newCollectionName);
    // Step 1: Parse the Excel file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const questionsFromExcel: Question[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Log the parsed data to inspect the rows and check for empty ones
    console.log("Parsed Excel Data:", questionsFromExcel);

    // Step 2: Reference the new collection in Firestore
    const newCollectionRef = collection(db, newCollectionName);

    // Step 3: Upload each row as a new document in the new collection
    const uploadPromises = questionsFromExcel.map(async (questionData) => {
      // Ensure `validBounds` is correctly structured
      const question: Question = {
        id: questionData.id,
        index: questionData.index,
        question: questionData.question,
        category: questionData.category,
        color: questionData.color,
        comment: questionData.comment,
        responseType: questionData.responseType,
        validBounds: {
          min: questionData.validBounds?.min ?? 0,
          max: questionData.validBounds?.max ?? 0,
          options: questionData.validBounds?.options ?? "",
        },
        frequency: questionData.frequency
      };

      // Upload the question as a document with the `id` as the document ID
      const questionRef = doc(newCollectionRef, question.id);
      await setDoc(questionRef, question);
      console.log(`Uploaded question with ID: ${question.id}`);
    });

    await Promise.all(uploadPromises); // Wait for all uploads to complete

    console.log(`All questions uploaded to the new collection: ${newCollectionName}`);
  } catch (error) {
    console.error("Error uploading questions to new collection:", error);
  }
}
