import {
  sessionRecordSchema,
  type SessionLoadReport,
  type SessionRecord,
} from "./types";

const DB_NAME = "vagus-reset-coach";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

export async function saveSession(record: SessionRecord) {
  const parsed = sessionRecordSchema.parse(record);
  const db = await openDatabase();
  await requestToPromise(
    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(parsed),
  );
  db.close();
}

export async function getSessions(): Promise<SessionRecord[]> {
  return (await getSessionLoadReport()).records;
}

export async function getSessionLoadReport(): Promise<SessionLoadReport> {
  const db = await openDatabase();
  const records = await requestToPromise<unknown[]>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(),
  );
  db.close();
  return normalizeSessionRecords(records);
}

export function normalizeSessionRecords(records: unknown[]): SessionLoadReport {
  let skippedRecords = 0;
  const parsedRecords = records.flatMap((record) => {
    const result = sessionRecordSchema.safeParse(record);
    if (!result.success) {
      skippedRecords += 1;
      return [];
    }
    return [result.data];
  });

  return {
    records: parsedRecords.sort(
      (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
    ),
    skippedRecords,
  };
}

export async function clearSessions() {
  const db = await openDatabase();
  await requestToPromise(
    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear(),
  );
  db.close();
}

export async function replaceSessions(records: SessionRecord[]) {
  const parsedRecords = records.map((record) =>
    sessionRecordSchema.parse(record),
  );
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await requestToPromise(store.clear());
  for (const record of parsedRecords) {
    await requestToPromise(store.put(record));
  }
  await transactionToPromise(transaction);
  db.close();
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("startedAt", "startedAt");
      }
    };
    request.onerror = () =>
      reject(
        request.error ?? new Error("Could not open local session database"),
      );
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.oncomplete = () => resolve();
  });
}
