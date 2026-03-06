import { lerp, clamp } from './presets';

export function hexToRgb(hex: string) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number) {
	return (
		'#' +
		[r, g, b]
			.map((v) =>
				Math.round(clamp(v, 0, 255))
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

export function lerpColor(a: string, b: string, t: number) {
	const [ar, ag, ab] = hexToRgb(a);
	const [br, bg, bb] = hexToRgb(b);
	return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t));
}

export function interpolateColor(a: string, b: string, t: number) {
	return lerpColor(a, b, t);
}

export function lerpVal(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
