# indexeddb_wrapper
Simplified operation of indexedDB and support for Promise

# sample

```
interface SampleTable {
  date: string;
}

class SampleDatabase extends DatabaseScriptsBase<SampleTable> {
  public keyPath: string = "database/sample";

  constructor(storeName: "sample", mode: IDBTransactionMode) {
    super(storeName, mode);
  }

}

document.getElementById("init")!.addEventListener("click", async () => {
  const db = new SampleDatabase("sample", "readwrite");
  await db.initialize({ keyPath: db.keyPath, data: [] });
  await db.get(db.keyPath);
});

document.getElementById("add")!.addEventListener("click", async () => {
  const db = new SampleDatabase("sample", "readwrite");
  await db.put({
    keyPath: db.keyPath,
    data: [
      { date: new Date().getTime().toString() },
      { date: new Date().getTime().toString() + 1 }
    ]
  });
});
```