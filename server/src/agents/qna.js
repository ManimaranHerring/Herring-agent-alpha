import db from '../db.js';
import { naiveRetrieve } from '../util/retrieval.js';
import { chatLLM } from '../llm.js';

export async function run({ question }) {
  if (!question) throw new Error('question is required');

  const [rows] = await db.query(
    'SELECT id, content FROM documents ORDER BY id DESC LIMIT 300'
  );

  const docs = rows.map(r => ({ id: r.id, text: JSON.stringify(r.content) }));
  const ctx = naiveRetrieve(docs, question, 6)
    .map(d => `[#${d.id}] ${d.text}`)
    .join('\n\n');

  const system = 'You are a helpful domain assistant. Cite source IDs like [#id] when using facts.';
  const prompt = `Use the CONTEXT to answer.\n\nCONTEXT:\n${ctx}\n\nQUESTION:\n${question}\n\nAnswer:`;
  const answer = await chatLLM({ system, prompt });
  return { answer, used_docs: ctx.length > 0 };
}
