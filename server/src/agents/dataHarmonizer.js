import db from '../db.js';
import { mapSchema } from '../cells/transform/schemaMap.js';
import { entityMatch } from '../cells/match/entityMatch.js';

export async function run({ entityType = 'product', schema = { id: 'id', name: 'name', price: 'price' } }) {
  const [rows] = await db.query(
    "SELECT content FROM documents WHERE type IN ('csv_row','erp_row') ORDER BY id DESC LIMIT 2000"
  );
  const raw = rows.map(r => r.content);

  if (raw.length === 0) return { message: 'No rows yet. Upload a CSV or run ERP sync.' };

  const mapped = raw.map(r => mapSchema(r, schema));
  const unique = entityMatch(mapped, 'name');

  for (const it of unique) {
    await db.execute(
      'INSERT INTO harmonized_data (entity_type, data_json) VALUES (?, ?)',
      [entityType, JSON.stringify(it)]
    );
  }
  return { ingested: raw.length, harmonized: unique.length };
}
