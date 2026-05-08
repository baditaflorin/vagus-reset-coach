import { sessionRecordSchema, type SessionRecord } from './types'

const DB_NAME = 'vagus-reset-coach'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

export async function saveSession(record: SessionRecord) {
  const parsed = sessionRecordSchema.parse(record)
  const db = await openDatabase()
  await requestToPromise(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(parsed))
  db.close()
}

export async function getSessions(): Promise<SessionRecord[]> {
  const db = await openDatabase()
  const records = await requestToPromise<SessionRecord[]>(
    db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll(),
  )
  db.close()
  return records
    .map((record) => sessionRecordSchema.safeParse(record))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
}

export async function clearSessions() {
  const db = await openDatabase()
  await requestToPromise(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).clear())
  db.close()
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('startedAt', 'startedAt')
      }
    }
    request.onerror = () => reject(request.error ?? new Error('Could not open local session database'))
    request.onsuccess = () => resolve(request.result)
  })
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
    request.onsuccess = () => resolve(request.result)
  })
}
