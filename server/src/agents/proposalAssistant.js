import db from '../db.js';
import { chatLLM } from '../llm.js';

export async function run({ prompt }) {
  const [rows] = await db.query('SELECT id, content FROM documents ORDER BY id DESC LIMIT 150');
  const memory = rows.map(r => `[#${r.id}] ${JSON.stringify(r.content)}`).join('\n\n');

  const system = 'You write concise, professional proposal sections. Reuse relevant context without fabricating.';
  const user = `Draft a proposal section.\nUser brief:\n${prompt || 'N/A'}\n\nCONTEXT:\n${memory}\n`;
  const draft = await chatLLM({ system, prompt: user });
  return { draft };
}
