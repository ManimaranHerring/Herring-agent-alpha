import db from '../db.js';

export async function genericRestSync() {
  const base = process.env.ERP_BASE_URL;
  const key = process.env.ERP_API_KEY;
  if (!base || !key) return 0;

  const authHeader = process.env.ERP_AUTH_HEADER || 'X-API-KEY';
  const endpoints = ['/products', '/customers']; // tweak for your ERP/CRM

  let total = 0;
  for (const ep of endpoints) {
    const url = base.replace(/\/+$/,'') + ep;
    const resp = await fetch(url, { headers: { [authHeader]: key } });
    if (!resp.ok) continue;
    const data = await resp.json();
    if (Array.isArray(data)) {
      for (const row of data) {
        await db.execute('INSERT INTO documents (type, content) VALUES (?, ?)', ['erp_row', JSON.stringify(row)]);
      }
      total += data.length;
    }
  }
  return total;
}
