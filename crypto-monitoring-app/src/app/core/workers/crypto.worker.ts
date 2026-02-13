/* eslint-disable no-restricted-globals */
addEventListener('message', (ev: MessageEvent) => {
	// expect { id: string, prices: number[] }
	const data = ev.data as { id?: string; prices?: number[] };
	const prices = Array.isArray(data?.prices) ? data!.prices! : [];
	const id = data?.id ?? null;
	const n = prices.length;
	if (!n) {
		postMessage({ id, avg: 0, vol: 0 });
		return;
	}
	const avg = prices.reduce((acc: number, v: number) => acc + v, 0) / n;
	const variance = prices.reduce((acc: number, v: number) => acc + Math.pow(v - avg, 2), 0) / n;
	const vol = Math.sqrt(variance);
	postMessage({ id, avg, vol });
});
