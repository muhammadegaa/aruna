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
import { Business, Entity, Transaction, FinancialConfig, MetricDaily, AgentLog } from "../firestore/types";

const getDb = () => getFirestoreInstance();

// Business CRUD - now org-scoped
export const getBusiness = async (businessId: string): Promise<Business | null> => {
  const db = getDb();
  const businessDoc = await getDoc(doc(db, "businesses", businessId));
  if (!businessDoc.exists()) {
    return null;
  }
  return { id: businessDoc.id, ...businessDoc.data() } as Business;
};

export const getBusinessesByOrg = async (orgId: string): Promise<Business[]> => {
  const db = getDb();
  const q = query(collection(db, "businesses"), where("orgId", "==", orgId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Business));
};

// Legacy: get by owner (for backward compatibility during migration)
export const getBusinessesByOwner = async (ownerUid: string): Promise<Business[]> => {
  const db = getDb();
  const q = query(collection(db, "businesses"), where("ownerUid", "==", ownerUid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Business));
};

export const createBusiness = async (
  business: Omit<Business, "id" | "createdAt">
): Promise<string> => {
  const db = getDb();
  const docRef = await addDoc(collection(db, "businesses"), {
    ...business,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateBusiness = async (
  businessId: string,
  updates: Partial<Omit<Business, "id" | "createdAt">>
): Promise<void> => {
  const db = getDb();
  await setDoc(doc(db, "businesses", businessId), updates, { merge: true });
};

export const deleteBusiness = async (businessId: string): Promise<void> => {
  const db = getDb();
  await deleteDoc(doc(db, "businesses", businessId));
};

// Entities subcollection
export const getEntities = async (businessId: string): Promise<Entity[]> => {
  const db = getDb();
  const snapshot = await getDocs(collection(db, "businesses", businessId, "entities"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Entity));
};

export const addEntity = async (businessId: string, entity: Omit<Entity, "id">): Promise<string> => {
  const db = getDb();
  const docRef = await addDoc(collection(db, "businesses", businessId, "entities"), entity);
  return docRef.id;
};

// Transactions subcollection
export const getTransactions = async (
  businessId: string,
  options?: {
    kind?: "revenue" | "expense";
    from?: Date;
    to?: Date;
  }
): Promise<Transaction[]> => {
  const db = getDb();
  let q = query(collection(db, "businesses", businessId, "transactions"));

  if (options?.kind) {
    q = query(q, where("kind", "==", options.kind));
  }

  const snapshot = await getDocs(q);
  let transactions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];

  // Filter by date range if provided
  if (options?.from || options?.to) {
    transactions = transactions.filter((t) => {
      const date = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      if (options.from && date < options.from) return false;
      if (options.to && date > options.to) return false;
      return true;
    });
  }

  return transactions;
};

export const addTransaction = async (
  businessId: string,
  transaction: Omit<Transaction, "id">
): Promise<string> => {
  const db = getDb();
  const docRef = await addDoc(collection(db, "businesses", businessId, "transactions"), transaction);
  return docRef.id;
};

// Config subcollection
export const getFinancialConfig = async (businessId: string): Promise<FinancialConfig | null> => {
  const db = getDb();
  const docRef = await getDoc(doc(db, "businesses", businessId, "config", "financials"));
  if (!docRef.exists()) {
    return null;
  }
  return docRef.data() as FinancialConfig;
};

export const setFinancialConfig = async (
  businessId: string,
  config: FinancialConfig
): Promise<void> => {
  const db = getDb();
  await setDoc(doc(db, "businesses", businessId, "config", "financials"), config);
};

// MetricsDaily subcollection
export const getMetricsDaily = async (
  businessId: string,
  options?: {
    metricKey?: string;
    from?: Date;
    to?: Date;
  }
): Promise<MetricDaily[]> => {
  const db = getDb();
  let q = query(collection(db, "businesses", businessId, "metricsDaily"));

  if (options?.metricKey) {
    q = query(q, where("metricKey", "==", options.metricKey));
  }

  const snapshot = await getDocs(q);
  let metrics = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown as MetricDaily[];

  // Filter by date range if provided
  if (options?.from || options?.to) {
    metrics = metrics.filter((m) => {
      const date = m.date instanceof Timestamp ? (m.date as Timestamp).toDate() : new Date(m.date);
      if (options.from && date < options.from) return false;
      if (options.to && date > options.to) return false;
      return true;
    });
  }

  return metrics;
};

// Agent logs
export const addAgentLog = async (
  businessId: string,
  log: Omit<AgentLog, "id" | "timestamp">
): Promise<string> => {
  const db = getDb();
  const docRef = await addDoc(collection(db, "businesses", businessId, "agentLogs"), {
    ...log,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

export const getAgentLogs = async (
  businessId: string,
  limit: number = 50
): Promise<AgentLog[]> => {
  const db = getDb();
  const q = query(collection(db, "businesses", businessId, "agentLogs"), where("timestamp", ">", Timestamp.fromDate(new Date(0))));
  const snapshot = await getDocs(q);
  const logs = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as AgentLog))
    .sort((a, b) => {
      const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
      const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
  return logs;
};

