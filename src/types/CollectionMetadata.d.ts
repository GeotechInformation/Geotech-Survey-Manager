import { Timestamp } from "firebase/firestore";

/**
 * Colelction Metadata
 */
export interface CollectionMetadata {
  name: string;
  createdAt: {
    time: Timestamp,
    userId: string;
    userName: string;
  };
  lastSaved: {
    time: Timestamp
    userId: string;
    userName: string;
  };
  deleted?: {
    deletedAt: Timestamp,
    userId: string;
    userName: string;
  }
}