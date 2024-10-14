// Firebase Config ts
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { clientConfig } from './config';

/**
 * Initialize Firebase
 * Intialises firebase, auth and db by checking first if the app is already intialised
 * @returns Firebase App, Auth, Firestore Database
 */
const initializeFirebase = (): { firebaseApp: FirebaseApp, db: Firestore } => {
  let app;
  if (!getApps().length) {
    app = initializeApp(clientConfig);
  } else {
    app = getApp();
  }
  const firestore = getFirestore(app);

  return { firebaseApp: app, db: firestore };
};

const { firebaseApp, db } = initializeFirebase();
export { firebaseApp, db };