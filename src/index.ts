/**
 * Database format to be passed to IndexedDBWrapper
 */
export interface DatabaseTableBase<T> {
  keyPath: string;
  data: T;
}

/**
 * Operate IndexedDB
 */
export class IndexedDBWrapper<T> {
  private storeName: string;
  private mode: IDBTransactionMode;
  private readonly KEYPATH: "keyPath" = "keyPath";

  constructor(storeName: string, mode: IDBTransactionMode) {
    this.storeName = storeName;
    this.mode = mode;
  }

  /** error format */
  private requestError(message: string): Error {
    return new Error(`indexedDB open failed:${message}`);
  }

  /** get IDBConstructor from event */
  private getDatabaseConstructor(event: Event): IDBDatabase | null {
    return event.target === null ? null : ((event.target) as any).result as IDBDatabase;
  }

  /** create object store if there is not specific datastore */
  private createObjectStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      db.createObjectStore(this.storeName, { keyPath: this.KEYPATH });
    }
  }

  /** check if has specific key */
  private hasValueInSpecificKey(store: IDBObjectStore, key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const request = store.getKey(key);
      request.onerror = () => reject(false);
      request.onsuccess = (e) => {
        resolve(!((e.target as any).result === undefined));
      };
    });
  }

  /** initialize indexedDB */
  public initialize(initValue: DatabaseTableBase<T>) {
    return new Promise<DatabaseTableBase<T>>((resolve, reject) => {
      const request = indexedDB.open(this.storeName);
      request.onerror = () => reject(this.requestError(`${this.initialize.name} indexeddb request failed`));
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = this.getDatabaseConstructor(event);
        if (db === null) return reject(this.requestError(`${this.initialize.name} indexeddb onupgradeneeded failed`));
        this.createObjectStore(db);
      };
      request.onsuccess = (event: Event) => {
        const db = this.getDatabaseConstructor(event);
        if (db === null) return reject(this.requestError(`${this.initialize.name} indexeddb initialize put failed`));
        try {
          const store = db.transaction(this.storeName, this.mode).objectStore(this.storeName);
          this.hasValueInSpecificKey(store, initValue.keyPath).then(e => {
            console.log(e);
            if (!e) {
              const putResult = store.put(initValue);
              putResult.onerror = () => reject(this.requestError(`${this.initialize.name} indexeddb initialize put failed`));
              putResult.onsuccess = () => resolve(initValue);
            }
          });
        } finally {
          db.close();
        }
      };
    });
  }

  /** get data in indexeddb */
  public get(id: DatabaseTableBase<T>["keyPath"]): Promise<DatabaseTableBase<T>> {
    return new Promise<DatabaseTableBase<T>>((resolve, reject) => {
      const request = indexedDB.open(this.storeName);
      request.onerror = () => reject(Error("Error text"));
      request.onsuccess = (event: Event) => {
        const db = this.getDatabaseConstructor(event);
        if (db === null) return reject(this.requestError(`${this.get.name} indexeddb get failed`));
        try {
          const transaction = db.transaction(this.storeName, this.mode);
          const store = transaction.objectStore(this.storeName);
          const getRequest = store.get(id);
          getRequest.onerror = () => reject(this.requestError(`${this.get.name} indexeddb get failed`));
          getRequest.onsuccess = () => resolve(getRequest.result);
        } finally {
          db.close();
        }
      };
    });
  }

  /** add data to indexeddb. Creates a new record even if a duplicate KeyPath exists  */
  public add(object: DatabaseTableBase<T>): Promise<DatabaseTableBase<T>> {
    return new Promise<DatabaseTableBase<T>>((resolve, reject) => {
      const request = indexedDB.open(this.storeName);
      request.onerror = () => reject(this.requestError(`${this.put.name} indexeddb request failed`));
      request.onsuccess = (event: Event) => {
        const db = this.getDatabaseConstructor(event);
        if (db === null) return reject(this.requestError(`${this.initialize.name} indexeddb put failed`));
        try {
          const transaction = db.transaction(this.storeName, this.mode);
          const store = transaction.objectStore(this.storeName);
          const putResult = store.add(object);
          putResult.onerror = () => reject(this.requestError(`${this.initialize.name} indexeddb put failed`));
          putResult.onsuccess = () => resolve(object);
        } finally {
          db.close();
        }
      };
    });
  }

  /** put data to indexeddb. Overwrites duplicate KeyPaths, if any. */
  public put(object: DatabaseTableBase<T>): Promise<DatabaseTableBase<T>> {
    return new Promise<DatabaseTableBase<T>>((resolve, reject) => {
      const request = indexedDB.open(this.storeName);
      request.onerror = () => reject(this.requestError(`${this.put.name} indexeddb request failed`));
      request.onsuccess = (event: Event) => {
        const db = this.getDatabaseConstructor(event);
        if (db === null) return reject(this.requestError(`${this.initialize.name} indexeddb put failed`));
        try {
          const transaction = db.transaction(this.storeName, this.mode);
          const store = transaction.objectStore(this.storeName);
          const putResult = store.put(object);
          putResult.onerror = () => reject(this.requestError(`${this.initialize.name} indexeddb put failed`));
          putResult.onsuccess = () => resolve(object);
        } finally {
          db.close();
        }
      };
    });
  }
}
