export function entityMatch(items, key='name') {
  const seen = new Map();
  for (const it of items) {
    const k = String(it[key] ?? '').trim().toLowerCase();
    if (!k) continue;
    if (!seen.has(k)) seen.set(k, it);
  }
  return Array.from(seen.values());
}
