import { movingAverage } from '../cells/analyze/forecast.js';

export async function run({ series = [10,11,13,12,15,14,18,19,20], window = 3 }) {
  return { input: series, window, forecast: movingAverage(series, window) };
}
