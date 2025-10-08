const useOllama = !!process.env.OLLAMA_MODEL;

export async function chatLLM({ system, prompt, model = process.env.LLM_MODEL || 'gpt-4o-mini' }) {
  if (useOllama) {
    const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const body = {
      model: process.env.OLLAMA_MODEL,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      stream: false
    };
    const resp = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`Ollama error: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data?.message?.content || '';
  } else {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('Set OPENAI_API_KEY or OLLAMA_MODEL in .env');
    const body = {
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    };
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(`OpenAI error: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content || '';
  }
}
