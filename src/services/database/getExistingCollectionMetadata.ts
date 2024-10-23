import { collection, getDocs } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { CollectionMetadata } from "@/types/CollectionMetadata";


export default async function getExistingCollectionMetadata() {
  try {
    // Reference to the #_Metadata collection
    const metadataCollectionRef = collection(db, "#_Metadata");

    // Get all documents in the #_Metadata collection
    const metadataDocsSnapshot = await getDocs(metadataCollectionRef);

    // Extract names and sort alphabetically
    const sortedMetadata = metadataDocsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as CollectionMetadata;
        return data;  // Return the full CollectionMetadata object
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return sortedMetadata;
  } catch (error) {
    throw error;
  }
}