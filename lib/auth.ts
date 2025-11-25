import { getAuthInstance } from "./firebase";
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";

export const signInAnonymous = async (): Promise<User> => {
  const auth = getAuthInstance();
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};



