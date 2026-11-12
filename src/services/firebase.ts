import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { normalizeLanguage } from '../data/languages.ts';
import type { WordItem } from '../types/dictionary.ts';

// 1. Firebase config comes from VITE_FIREBASE_* env vars (.env.local locally, repo secrets in CI)
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missingKeys.length > 0) {
  console.error(`Firebase config is missing: ${missingKeys.join(', ')}. Check your .env.local file.`);
}

const firestoreDatabaseId: string = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);

// 2. Validate connection on initial boot as required by Firestore integration
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection: client is offline or initializing.');
      return false;
    }
    return true;
  }
}
testFirestoreConnection();

// 3. Error Handling conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Authentication Helpers
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await ensureUserProfile(result.user);
  }
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  if (result.user) {
    await ensureUserProfile(result.user);
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

async function ensureUserProfile(user: User) {
  const path = `users/${user.uid}`;
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 5. User-based Firestore Data CRUD
export function subscribeToUserWords(
  userId: string,
  onData: (words: WordItem[]) => void,
  onError: (err: unknown) => void
) {
  const path = `users/${userId}/words`;
  return onSnapshot(
    collection(db, 'users', userId, 'words'),
    (snapshot) => {
      const words: WordItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        words.push({
          id: docSnap.id,
          language: normalizeLanguage(data.language),
          word: data.word,
          phonetic: data.phonetic || undefined,
          partOfSpeech: data.partOfSpeech || 'noun',
          cefrLevel: data.cefrLevel || undefined,
          meanings: Array.isArray(data.meanings) ? data.meanings : [],
          examples: Array.isArray(data.examples) ? data.examples : [],
          synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
          antonyms: Array.isArray(data.antonyms) ? data.antonyms : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          personalNote: data.personalNote || undefined,
          status: data.status || 'new',
          reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
          lastReviewedAt: data.lastReviewedAt || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          favorite: !!data.favorite,
          userId,
        });
      });
      onData(words);
    },
    (error) => {
      // Notify the caller first: handleFirestoreError logs and then throws.
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

function toFirestoreWord(userId: string, word: WordItem) {
  return {
    id: word.id,
    userId,
    language: word.language,
    word: word.word,
    phonetic: word.phonetic || '',
    partOfSpeech: word.partOfSpeech,
    cefrLevel: word.cefrLevel || '',
    meanings: word.meanings || [],
    examples: word.examples || [],
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
    tags: word.tags || [],
    personalNote: word.personalNote || '',
    status: word.status,
    reviewCount: word.reviewCount || 0,
    lastReviewedAt: word.lastReviewedAt || '',
    favorite: !!word.favorite,
    createdAt: word.createdAt || new Date().toISOString(),
    updatedAt: word.updatedAt || new Date().toISOString(),
  };
}

export async function saveUserWord(userId: string, word: WordItem): Promise<void> {
  const path = `users/${userId}/words/${word.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'words', word.id), toFirestoreWord(userId, word));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserWord(userId: string, wordId: string): Promise<void> {
  const path = `users/${userId}/words/${wordId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'words', wordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/** Firestore limits a write batch to 500 operations, so large syncs are split into chunks. */
const BATCH_LIMIT = 450;

export async function batchSyncWordsToFirestore(userId: string, words: WordItem[]): Promise<void> {
  if (words.length === 0) return;
  const path = `users/${userId}/words`;
  try {
    for (let i = 0; i < words.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const word of words.slice(i, i + BATCH_LIMIT)) {
        batch.set(doc(db, 'users', userId, 'words', word.id), toFirestoreWord(userId, word), { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/** Deletes the given words (e.g. when a dictionary is reset or replaced by an import). */
export async function batchDeleteWordsFromFirestore(userId: string, wordIds: string[]): Promise<void> {
  if (wordIds.length === 0) return;
  const path = `users/${userId}/words`;
  try {
    for (let i = 0; i < wordIds.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const wordId of wordIds.slice(i, i + BATCH_LIMIT)) {
        batch.delete(doc(db, 'users', userId, 'words', wordId));
      }
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
