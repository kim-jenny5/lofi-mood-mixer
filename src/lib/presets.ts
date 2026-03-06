import type { MoodValues, Preset } from '../types';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) =>
	Math.max(lo, Math.min(hi, v));

export const PRESETS: Preset[] = [
	{
		name: 'Deep Focus',
		emoji: '🎯',
		values: { energy: 0.9, weather: 0.1, warmth: 0.5, time: 0.6, nature: 0.3 }
	},
	{
		name: 'Rainy Drift',
		emoji: '🌧️',
		values: { energy: 0.2, weather: 0.9, warmth: 0.8, time: 0.7, nature: 0.5 }
	},
	{
		name: 'Golden Hour',
		emoji: '🌅',
		values: { energy: 0.55, weather: 0.0, warmth: 0.7, time: 0.1, nature: 0.8 }
	},
	{
		name: 'Midnight Haze',
		emoji: '🌙',
		values: { energy: 0.15, weather: 0.3, warmth: 0.9, time: 1.0, nature: 0.4 }
	},
	{
		name: 'Forest Bath',
		emoji: '🌿',
		values: { energy: 0.45, weather: 0.2, warmth: 0.4, time: 0.35, nature: 1.0 }
	}
];

export const DEFAULT_VALUES: MoodValues = {
	energy: 0.3,
	weather: 0.1,
	warmth: 0.6,
	time: 0.5,
	nature: 0.4
};
