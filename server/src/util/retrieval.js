export function naiveRetrieve(docs, query, k=5) {
  const q = tokenize(query);
  const scored = docs.map(d => ({
    id: d.id,
    text: d.text,
    score: score(tokenize(d.text), q)
  }));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,k);
}
function tokenize(s) {
  return String(s||'').toLowerCase().match(/[a-z0-9]+/g) || [];
}
function score(docTokens, qTokens) {
  const set = new Set(docTokens);
  let c = 0;
  for (const t of qTokens) if (set.has(t)) c++;
  return c;
}
