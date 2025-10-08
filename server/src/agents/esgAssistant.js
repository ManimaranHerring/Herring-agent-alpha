import { chatLLM } from '../llm.js';

export async function run({ question = 'Suggest key ESG metrics we should track for a basic sustainability report.' }) {
  const system = 'You are an ESG assistant. Offer practical, non-legal guidance and measurable indicators.';
  const answer = await chatLLM({ system, prompt: question });
  return { answer };
}
