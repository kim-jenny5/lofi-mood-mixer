// ─── Math helpers ─────────────────────────────────────────────────────────────

export const lerp = (a: number, b: number, t: number): number =>
	a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number): number =>
	Math.max(lo, Math.min(hi, v));
export const n01 = (v: number): number => clamp(v, 0, 100) / 100;

// ─── Multi-stop color interpolation ──────────────────────────────────────────

interface ColorStop {
	t: number;
	c: [number, number, number];
}

function interpStops(stops: ColorStop[], t: number): [number, number, number] {
	let lo = stops[0];
	let hi = stops[stops.length - 1];
	for (let i = 0; i < stops.length - 1; i++) {
		if (t >= stops[i].t && t <= stops[i + 1].t) {
			lo = stops[i];
			hi = stops[i + 1];
			break;
		}
	}
	const f = lo.t === hi.t ? 0 : (t - lo.t) / (hi.t - lo.t);
	return lo.c.map((ch, i) => Math.round(lerp(ch, hi.c[i], f))) as [
		number,
		number,
		number
	];
}

// ─── Sky gradient computer ────────────────────────────────────────────────────

export interface SkyColors {
	top: string;
	bottom: string;
}

export function computeSky(time: number, warmth: number): SkyColors {
	const t = n01(time);
	const w = n01(warmth);

	const topStops: ColorStop[] = [
		{ t: 0.0, c: [8, 5, 22] },
		{ t: 0.1, c: [130, 60, 80] },
		{ t: 0.18, c: [220, 100, 55] },
		{ t: 0.32, c: [105, 172, 245] },
		{ t: 0.55, c: [58, 125, 210] },
		{ t: 0.66, c: [195, 95, 55] },
		{ t: 0.78, c: [32, 15, 72] },
		{ t: 0.9, c: [9, 6, 32] },
		{ t: 1.0, c: [2, 2, 12] }
	];
	const botStops: ColorStop[] = [
		{ t: 0.0, c: [40, 14, 58] },
		{ t: 0.1, c: [245, 155, 90] },
		{ t: 0.18, c: [255, 205, 130] },
		{ t: 0.32, c: [175, 218, 255] },
		{ t: 0.55, c: [135, 192, 250] },
		{ t: 0.66, c: [255, 148, 72] },
		{ t: 0.78, c: [110, 52, 95] },
		{ t: 0.9, c: [18, 10, 48] },
		{ t: 1.0, c: [5, 4, 18] }
	];

	let top = interpStops(topStops, t);
	let bot = interpStops(botStops, t);

	const wShift = Math.max(0, w - 0.3) / 0.7;
	top = [
		clamp(top[0] + Math.round(wShift * 42), 0, 255),
		top[1],
		clamp(top[2] - Math.round(wShift * 28), 0, 255)
	];
	bot = [
		clamp(bot[0] + Math.round(wShift * 52), 0, 255),
		bot[1],
		clamp(bot[2] - Math.round(wShift * 22), 0, 255)
	];

	return { top: `rgb(${top})`, bottom: `rgb(${bot})` };
}
