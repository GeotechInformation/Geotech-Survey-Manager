// Firebase Config ts
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from "firebase/firestore";
import { clientConfig } from './config';

/**
 * Initialize Firebase
 * Intialises firebase, auth and db by checking first if the app is already intialised
 * @returns Firebase App, Auth, Firestore Database
 */
const initializeFirebase = (): { firebaseApp: FirebaseApp, auth: Auth, db: Firestore } => {
  let app;
  if (!getApps().length) {
    app = initializeApp(clientConfig);
  } else {
    app = getApp();
  }
  const firestore = getFirestore(app);
  const authentication = getAuth(app);

  return { firebaseApp: app, auth: authentication, db: firestore };
};

const { firebaseApp, auth, db, } = initializeFirebase();
export { firebaseApp, auth, db, };