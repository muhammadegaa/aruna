import { getFirestoreInstance } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Organization, OrganizationMember } from "../firestore/types";

const getDb = () => getFirestoreInstance();

// Organization CRUD
export const createOrganization = async (
  name: string,
  ownerUid: string,
  plan: "free" | "pro" = "free"
): Promise<string> => {
  const db = getDb();
  const orgRef = await addDoc(collection(db, "organizations"), {
    name,
    ownerUid,
    plan,
    createdAt: Timestamp.now(),
  });

  // Create owner membership
  await setDoc(doc(db, "organizations", orgRef.id, "members", ownerUid), {
    role: "owner" as const,
    joinedAt: Timestamp.now(),
  });

  return orgRef.id;
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const db = getDb();
  const orgDoc = await getDoc(doc(db, "organizations", orgId));
  if (!orgDoc.exists()) {
    return null;
  }
  return { id: orgDoc.id, ...orgDoc.data() } as Organization;
};

export const getOrganizationsByUser = async (userId: string): Promise<Organization[]> => {
  const db = getDb();
  
  // Get orgs where user is owner
  const ownedOrgsQuery = query(collection(db, "organizations"), where("ownerUid", "==", userId));
  const ownedSnapshot = await getDocs(ownedOrgsQuery);
  const ownedOrgs = ownedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Organization));

  // Get orgs where user is a member
  const allOrgs = await getDocs(collection(db, "organizations"));
  const memberOrgs: Organization[] = [];
  
  for (const orgDoc of allOrgs.docs) {
    const memberDoc = await getDoc(doc(db, "organizations", orgDoc.id, "members", userId));
    if (memberDoc.exists() && !ownedOrgs.some((o) => o.id === orgDoc.id)) {
      memberOrgs.push({ id: orgDoc.id, ...orgDoc.data() } as Organization);
    }
  }

  return [...ownedOrgs, ...memberOrgs];
};

export const updateOrganization = async (
  orgId: string,
  updates: Partial<Pick<Organization, "name" | "plan">>
): Promise<void> => {
  const db = getDb();
  await setDoc(doc(db, "organizations", orgId), updates, { merge: true });
};

// Membership management
export const getOrganizationMembers = async (orgId: string): Promise<OrganizationMember[]> => {
  const db = getDb();
  const snapshot = await getDocs(collection(db, "organizations", orgId, "members"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OrganizationMember[];
};

export const getUserRole = async (orgId: string, userId: string): Promise<"owner" | "admin" | "analyst" | null> => {
  const db = getDb();
  
  // Check if user is owner
  const org = await getOrganization(orgId);
  if (org?.ownerUid === userId) {
    return "owner";
  }

  // Check membership
  const memberDoc = await getDoc(doc(db, "organizations", orgId, "members", userId));
  if (memberDoc.exists()) {
    return memberDoc.data().role as "owner" | "admin" | "analyst";
  }

  return null;
};

export const addMember = async (
  orgId: string,
  userId: string,
  role: "admin" | "analyst"
): Promise<void> => {
  const db = getDb();
  await setDoc(doc(db, "organizations", orgId, "members", userId), {
    role,
    joinedAt: Timestamp.now(),
  });
};

export const removeMember = async (orgId: string, userId: string): Promise<void> => {
  const db = getDb();
  await deleteDoc(doc(db, "organizations", orgId, "members", userId));
};

export const updateMemberRole = async (
  orgId: string,
  userId: string,
  role: "admin" | "analyst"
): Promise<void> => {
  const db = getDb();
  await setDoc(
    doc(db, "organizations", orgId, "members", userId),
    { role },
    { merge: true }
  );
};

