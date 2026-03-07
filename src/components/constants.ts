// ─── Domain types ─────────────────────────────────────────────────────────────

export interface MoodVals {
	time: number;
	warmth: number;
	weather: number;
	nature: number;
}

export interface Preset extends MoodVals {
	id: string;
	name: string;
	emoji: string;
}

export interface SliderConfig {
	key: keyof MoodVals;
	label: string;
	left: string;
	right: string;
}

export interface SavedVibe {
	id: number;
	name: string;
	values: MoodVals;
}

export interface FireflyData {
	x: number;
	y: number;
	delay: string;
	dur: string;
}

export interface RainDrop {
	x: number;
	delay: string;
	dur: string;
}

// ─── App defaults ─────────────────────────────────────────────────────────────

export const INIT: MoodVals = { time: 78, warmth: 88, weather: 0, nature: 55 };

export const PRESETS: Preset[] = [
	{
		id: 'campfire',
		name: 'Campfire Glow',
		emoji: '🔥',
		time: 78,
		warmth: 95,
		weather: 0,
		nature: 48
	},
	{
		id: 'midnight',
		name: 'Midnight Study',
		emoji: '🌙',
		time: 93,
		warmth: 60,
		weather: 12,
		nature: 28
	},
	{
		id: 'rainy',
		name: 'Rainy Morning',
		emoji: '🌧',
		time: 22,
		warmth: 45,
		weather: 85,
		nature: 60
	},
	{
		id: 'golden',
		name: 'Golden Dusk',
		emoji: '🌅',
		time: 65,
		warmth: 88,
		weather: 5,
		nature: 72
	},
	{
		id: 'forest',
		name: 'Forest Nap',
		emoji: '🍃',
		time: 40,
		warmth: 35,
		weather: 22,
		nature: 95
	}
];

export const SLIDERS: SliderConfig[] = [
	{ key: 'time', label: 'Time', left: 'Sunrise', right: 'Midnight' },
	{ key: 'warmth', label: 'Warmth', left: 'Cool', right: 'Cozy' },
	{ key: 'weather', label: 'Weather', left: 'Clear', right: 'Rainy' },
	{ key: 'nature', label: 'Nature', left: 'Quiet', right: 'Vibrant' }
];

// ─── Scene data ───────────────────────────────────────────────────────────────

export const STARS: [number, number][] = [
	[148, 38],
	[202, 22],
	[278, 57],
	[352, 28],
	[418, 48],
	[488, 18],
	[552, 43],
	[622, 32],
	[682, 53],
	[724, 22],
	[782, 38],
	[838, 28],
	[102, 78],
	[168, 62],
	[322, 72],
	[462, 82],
	[582, 68],
	[702, 58],
	[752, 82],
	[812, 62],
	[882, 43],
	[52, 52],
	[92, 32],
	[132, 68],
	[245, 45],
	[510, 28],
	[660, 75],
	[915, 55]
];

export const FIREFLIES: FireflyData[] = Array.from({ length: 10 }, (_, i) => ({
	x: 160 + ((i * 89) % 480),
	y: 295 + ((i * 47) % 110),
	delay: ((i * 0.37) % 2).toFixed(2),
	dur: (1.8 + ((i * 0.28) % 1.6)).toFixed(2)
}));

export const RAIN: RainDrop[] = Array.from({ length: 48 }, (_, i) => ({
	x: (i * 19) % 920,
	delay: ((i * 0.065) % 0.9).toFixed(2),
	dur: (0.55 + ((i * 0.028) % 0.38)).toFixed(2)
}));
