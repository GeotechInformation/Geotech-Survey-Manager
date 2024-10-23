import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';


/**
 * Sign Out User
 */
export default async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw error;
  }
};