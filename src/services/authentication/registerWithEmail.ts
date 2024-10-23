import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import checkUserExists from "./checkUserExists";
import { auth, db } from "../../firebaseConfig";


/**
 * Register with Email
 * @param param firstName, email, password
 * @returns true is successfull, throws error if not
 */
export default async function registerWithEmail(userName: string, email: string, password: string): Promise<boolean | Error> {
  if (!auth)
    throw new Error('Authentication service not available');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userExists = await checkUserExists(userCredential.user.uid);
    if (!userExists) {
      await createEmailUserInDatabase(userCredential.user.uid, userName, email);
      sendEmailVerification(userCredential.user);
    }
    return true;
  } catch (error: any) {
    throw error;
  }
}


/**
 * Create a user account within the Realtime Database using Email/Password
 * @param userId User Identification
 * @param displayName Username
 * @param email User Email
 */
async function createEmailUserInDatabase(userId: string, userName: string, email: string) {
  try {

    await setDoc(doc(db, `USERS/${userId}`), {
      uid: userId,
      userName: userName,
      email: email,
    });
  } catch (error: any) {
    throw error;
  }
}