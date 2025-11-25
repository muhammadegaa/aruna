"use client";

import { useState, useEffect } from "react";
import { getAuthInstance } from "@/lib/firebase";
import { signInAnonymous } from "@/lib/auth";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!isMounted) return;
        setUser(currentUser);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Auth state change error:", err);
        if (isMounted) {
          setError("Authentication error occurred. Please refresh the page.");
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const auth = getAuthInstance();
      await firebaseSignOut(auth);
      // Will trigger onAuthStateChanged which will sign in anonymously again
    } catch (err) {
      console.error("Sign out error:", err);
      throw err;
    }
  };

  return { user, isLoading, error, signOut };
}







