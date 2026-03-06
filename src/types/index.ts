export type MoodValues = {
	energy: number;
	weather: number;
	warmth: number;
	time: number;
	nature: number;
};

export type MoodKey = keyof MoodValues;

export type Preset = {
	name: string;
	emoji: string;
	values: MoodValues;
};
