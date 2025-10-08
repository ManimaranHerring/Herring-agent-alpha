export function movingAverage(series, window=3) {
  const w = Math.max(1, Math.floor(window));
  const out = [];
  for (let i=0;i<series.length;i++) {
    const start = Math.max(0, i - w + 1);
    const slice = series.slice(start, i+1).map(Number);
    const avg = slice.reduce((a,b)=>a+b,0)/slice.length;
    out.push(Number(avg.toFixed(3)));
  }
  return out;
}
