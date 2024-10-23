import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { Status } from '@/types/Status';
import { auth } from '../../firebaseConfig';

interface SignInData {
  email: string;
  password: string;
}

/**
 * 
 * @param param sign in data 
 * @returns 
 */
export default async function signInWithEmail({ email, password }: SignInData): Promise<Status | UserCredential> {
  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;

  } catch (error: any) {

    if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Invalid Email' };
    } else if (error.code === 'auth/wrong-password') {
      return { success: false, message: 'Incorrect Password' };
    } else if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'No account with that email was found' };
    } else if (error.code === 'auth/invalid-credential') {
      return { success: false, message: 'Invalid Email or Password' };
    } else {
      console.error('Authentication error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }

  }
}