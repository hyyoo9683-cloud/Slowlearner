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
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // 용량 초과 시 사진 제외하고 저장
    newRecord.photoUrl = null;
    records[records.length - 1] = newRecord;
    try {
      localStorage.setItem(KEY, JSON.stringify(records));
    } catch {
      // 사진 없이도 안 되면 오래된 기록 하나 제거 후 재시도
      records.splice(0, 1);
      localStorage.setItem(KEY, JSON.stringify(records));
    }
  }
  return newRecord;
}
