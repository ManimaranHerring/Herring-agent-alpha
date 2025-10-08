export function mapSchema(record, targetSchema) {
  const lower = Object.fromEntries(Object.entries(record).map(([k,v]) => [String(k).toLowerCase(), v]));
  const out = {};
  for (const [key, alias] of Object.entries(targetSchema)) {
    const val = lower[String(alias).toLowerCase()] ?? lower[key.toLowerCase()];
    out[key] = val ?? null;
  }
  return out;
}
