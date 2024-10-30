import { collection, getDocs, getDoc, setDoc, deleteDoc, doc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { Question } from "@/types/Question";
import { CollectionMetadata } from "@/types/CollectionMetadata";
import { Status } from "@/types/Status";
import getUserValue from "../../utils/getUserValue";

/**
 * Migrate Questions from Old Collection to New Collection and update metadata.
 */
export default async function renameCollectionInDB(oldName: string, newName: string): Promise<Status> {
  try {
    // Enforce authenticated user
    if (!auth.currentUser) {
      return { success: false, message: 'No user detected. Login to post' };
    }

    const userId = auth.currentUser.uid;
    const userName = await getUserValue(userId, "userName");

    // Reference to the old and new collections
    const oldCollectionRef = collection(db, oldName);
    const newCollectionRef = collection(db, newName);

    // Get all documents from the old collection
    const querySnapshot = await getDocs(oldCollectionRef);

    console.log(`Migrating ${querySnapshot.size} documents from ${oldName} to ${newName}.`);

    // Migrate each question document to the new collection
    const migrationPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const questionData = docSnapshot.data() as Question;
      const newDocRef = doc(newCollectionRef, docSnapshot.id);
      await setDoc(newDocRef, questionData); // Migrate the document

      console.log(`Migrated document with ID: ${docSnapshot.id}`);
    });

    await Promise.all(migrationPromises); // Wait for migration to complete

    // Create new metadata document for the new collection
    const oldMetadataRef = doc(db, "#_Metadata", oldName);
    const oldMetadataSnapshot = await getDoc(oldMetadataRef);

    if (!oldMetadataSnapshot.exists()) {
      console.error("Old metadata not found. Cannot copy metadata to the new collection.");
      return { success: false, message: 'No data exists' };
    }

    const oldMetadata = oldMetadataSnapshot.data() as CollectionMetadata;

    const newMetadata: CollectionMetadata = {
      ...oldMetadata,
      name: newName,
      lastSaved: {
        time: Timestamp.now(),
        userId,
        userName,
      }
    };

    // Save new metadata in #_Metadata
    const newMetadataDocRef = doc(db, "#_Metadata", newName);
    await setDoc(newMetadataDocRef, newMetadata);

    // Delete all documents in the old collection without updating frequencies
    const deletionPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const oldDocRef = doc(db, oldName, docSnapshot.id);
      await deleteDoc(oldDocRef);
      console.log(`Deleted document with ID: ${docSnapshot.id} from old collection`);
    });

    await Promise.all(deletionPromises); // Wait for all deletions to complete

    // Mark old collection metadata as deleted
    await updateDoc(oldMetadataRef, {
      deleted: {
        userId,
        userName,
        deletedAt: serverTimestamp(),
      },
    });

    console.log("Migration complete, old collection deleted, and metadata updated.");
    return { success: true, message: null };

  } catch (error) {
    throw error;
  }
}
