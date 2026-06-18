const KEY = 'slowrunner_records';

export function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecord(record) {
  const records = loadRecords();
  const newRecord = { ...record, id: Date.now(), createdAt: new Date().toISOString() };
  records.push(newRecord);
  localStorage.setItem(KEY, JSON.stringify(records));
  return newRecord;
}
