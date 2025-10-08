import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { ensureTables } from './db.js';
import agents from './agents/index.js';
import { genericRestSync } from './connectors/genericRest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await ensureTables(); // create tables on startup

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '20mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/agents', (req, res) => {
  res.json({ agents: Object.keys(agents) });
});

// ---- CSV ingest ----
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

app.post('/api/ingest/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const fpath = req.file.path;

    let count = 0;
    fs.createReadStream(fpath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', async (row) => {
        count++;
        await db.execute(
          'INSERT INTO documents (type, content) VALUES (?, ?)',
          ['csv_row', JSON.stringify(row)]
        );
      })
      .on('end', () => {
        fs.unlinkSync(fpath);
        res.json({ ok: true, rows: count });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: String(err) });
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// ---- Run an agent ----
app.post('/api/agent/:name/run', async (req, res) => {
  const agent = agents[req.params.name];
  if (!agent) return res.status(404).json({ error: `Unknown agent: ${req.params.name}` });
  try {
    const result = await agent.run(req.body || {});
    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// ---- ERP/CRM sync (generic REST) ----
app.get('/api/connectors/sync', async (req, res) => {
  try {
    const count = await genericRestSync();
    res.json({ ok: true, synced: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
