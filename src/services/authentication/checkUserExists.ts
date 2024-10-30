import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';


/**
 * Check User Exists
 * @param uid  user ID
 * @returns 
 */
export default async function checkUserExists(uid: string): Promise<boolean> {

  try {
    const snapshot = await getDoc(doc(db, `AAA_USERS/${uid}`));
    return snapshot.exists()
  } catch (error) {
    throw error;
  }
}