import { openDB, type IDBPDatabase } from 'idb';
import type { QueuedMutation } from '../types/todo';

const DB_NAME = 'todo-offline-queue';
const STORE_NAME = 'mutations';
const DB_VERSION = 1;

let db: IDBPDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('enqueuedAt', 'enqueuedAt');
        store.createIndex('clientRequestId', 'clientRequestId', { unique: true });
      }
    },
  });

  return db;
}

/**
 * Enqueue a mutation for offline sync
 */
export async function enqueueMutation(mutation: QueuedMutation): Promise<void> {
  const database = await getDB();
  await database.put(STORE_NAME, mutation);
}

/**
 * Get all queued mutations sorted by enqueue time
 */
export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  const database = await getDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('enqueuedAt');
  return await index.getAll();
}

/**
 * Remove a mutation from the queue
 */
export async function dequeueMutation(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORE_NAME, id);
}

/**
 * Check if a clientRequestId already exists in the queue
 */
export async function hasPendingMutation(clientRequestId: string): Promise<boolean> {
  const database = await getDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('clientRequestId');
  const existing = await index.get(clientRequestId);
  return !!existing;
}

/**
 * Update retry count for a mutation
 */
export async function updateRetryCount(id: string, retryCount: number): Promise<void> {
  const database = await getDB();
  const mutation = await database.get(STORE_NAME, id);
  if (mutation) {
    mutation.retryCount = retryCount;
    await database.put(STORE_NAME, mutation);
  }
}

/**
 * Clear all queued mutations (use carefully)
 */
export async function clearQueue(): Promise<void> {
  const database = await getDB();
  await database.clear(STORE_NAME);
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  const database = await getDB();
  return await database.count(STORE_NAME);
}
