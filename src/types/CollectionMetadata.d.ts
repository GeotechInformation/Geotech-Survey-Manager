import { Timestamp } from "firebase/firestore";

/**
 * Colelction Metadata
 */
export interface CollectionMetadata {
  name: string;
  createdAt: Timestamp;
  lastSaved: Timestamp;
}