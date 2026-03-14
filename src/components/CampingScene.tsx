import type { MoodVals } from '../lib/constants';
import { FIREFLIES, RAIN, STARS } from '../lib/constants';
import { clamp, computeSky, lerp, n01 } from '@/lib/utils';

const P = 4;
const s = (v: number) => Math.round(v / P) * P;

function stairTri(
	cx: number,
	peakY: number,
	baseY: number,
	halfW: number,
	steps = 6
): string {
	const dh = (baseY - peakY) / steps;
	const dw = halfW / steps;
	const pts: string[] = [`${s(cx)},${s(peakY)}`];
	for (let i = 0; i < steps; i++) {
		pts.push(`${s(cx + (i + 1) * dw)},${s(peakY + i * dh)}`);
		pts.push(`${s(cx + (i + 1) * dw)},${s(peakY + (i + 1) * dh)}`);
	}
	for (let i = steps - 1; i >= 0; i--) {
		pts.push(`${s(cx - (i + 1) * dw)},${s(peakY + (i + 1) * dh)}`);
		pts.push(`${s(cx - (i + 1) * dw)},${s(peakY + i * dh)}`);
	}
	return pts.join(' ');
}

function stairSlope(
	steps: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): [number, number][] {
	const pts: [number, number][] = [[s(x1), s(y1)]];
	for (let i = 0; i < steps; i++) {
		const nx = s(x1 + ((x2 - x1) * (i + 1)) / steps);
		const cy1 = s(y1 + ((y2 - y1) * i) / steps);
		const cy2 = s(y1 + ((y2 - y1) * (i + 1)) / steps);
		pts.push([nx, cy1], [nx, cy2]);
	}
	return pts;
}

function snowBand(coords: number[], maxY: number, depth: number): string {
	const pts: [number, number][] = [];
	for (let i = 0; i + 1 < coords.length; i += 2) {
		pts.push([coords[i], coords[i + 1]]);
	}

	const profile = pts.slice(1, pts.length - 1);

	const first = profile.findIndex(([, y]) => y <= maxY);
	if (first < 0) return '';
	const last =
		profile.length - 1 - [...profile].reverse().findIndex(([, y]) => y <= maxY);

	const band = profile.slice(first, last + 1);

	const topEdge = band.map(([x, y]) => `${x},${y}`).join(' ');
	const botEdge = [...band]
		.reverse()
		.map(([x, y]) => `${x},${y + depth}`)
		.join(' ');

	return `${topEdge} ${botEdge}`;
}

interface TreeProps {
	cx: number;
	base: number;
	sc?: number;
	dark: string;
	mid: string;
	bright: string;
	trunk: string;
	snow: number;
}

function Tree({ cx, base, sc = 1, dark, mid, bright, trunk, snow }: TreeProps) {
	const h = s(80 * sc);
	const tier = h / 3;
	const sf = `rgba(222,238,255,${Math.min(snow, 1)})`;
	const tiers = [
		{ top: s(base - tier), bot: base, hw: s(30 * sc), col: dark },
		{
			top: s(base - tier * 2),
			bot: s(base - tier * 0.6),
			hw: s(22 * sc),
			col: mid
		},
		{ top: s(base - h), bot: s(base - tier * 1.6), hw: s(14 * sc), col: bright }
	];
	return (
		<g shapeRendering='crispEdges'>
			<rect
				x={s(cx - P)}
				y={base}
				width={P * 2}
				height={s(14 * sc)}
				fill={trunk}
			/>
			{tiers.map(({ top, bot, hw, col }, i) => (
				<g key={i}>
					<polygon points={stairTri(cx, top, bot, hw, 5)} fill={col} />
					{snow > 0.05 && (
						<polygon
							points={stairTri(
								cx,
								top,
								s(top + (bot - top) * 0.4),
								s(hw * 0.5),
								3
							)}
							fill={sf}
						/>
					)}
				</g>
			))}
		</g>
	);
}

interface CloudProps {
	cx: number;
	cy: number;
	op: number;
	pal: [string, string, string];
}
function Cloud({ cx, cy, op, pal }: CloudProps) {
	const blocks: [number, number, number, number, 0 | 1 | 2][] = [
		[-48, 8, 96, 16, 0],
		[-40, -4, 80, 16, 0],
		[-24, -16, 48, 16, 1],
		[0, -16, 48, 16, 2],
		[-16, -28, 32, 16, 1],
		[-44, 4, 12, 8, 2]
	];
	return (
		<g
			opacity={op}
			style={{ transition: 'opacity 2s ease' }}
			shapeRendering='crispEdges'
		>
			{blocks.map(([dx, dy, bw, bh, pi], i) => (
				<rect
					key={i}
					x={s(cx + dx)}
					y={s(cy + dy)}
					width={s(bw)}
					height={s(bh)}
					fill={pal[pi]}
				/>
			))}
		</g>
	);
}

interface WeedProps {
	x: number;
	y: number;
	sc: number;
	op: number;
	gCol: string;
	gCol2: string;
}
function Weed({ x, y, sc, op, gCol, gCol2 }: WeedProps) {
	const h = Math.max(4, Math.round((14 * sc) / 4) * 4);
	const cx = s(x);
	const by = s(y);
	return (
		<g
			opacity={op}
			style={{ transition: 'opacity 2s ease' }}
			shapeRendering='crispEdges'
		>
			<rect x={cx - 1} y={by - h} width={2} height={h} fill={gCol} />
			<rect
				x={cx - 4}
				y={by - s(h * 0.8)}
				width={2}
				height={s(h * 0.8)}
				fill={gCol}
			/>
			<rect x={cx - 6} y={by - h} width={2} height={s(h * 0.4)} fill={gCol} />
			<rect
				x={cx + 2}
				y={by - s(h * 0.8)}
				width={2}
				height={s(h * 0.8)}
				fill={gCol}
			/>
			<rect x={cx + 4} y={by - h} width={2} height={s(h * 0.4)} fill={gCol} />
			<rect
				x={cx - 8}
				y={by - s(h * 0.5)}
				width={2}
				height={s(h * 0.5)}
				fill={gCol2}
			/>
			<rect
				x={cx + 6}
				y={by - s(h * 0.5)}
				width={2}
				height={s(h * 0.5)}
				fill={gCol2}
			/>
		</g>
	);
}

interface DandelionProps {
	x: number;
	y: number;
	stemH: number;
	op: number;
	isDay: boolean;
	nat: number;
}
function Dandelion({ x, y, stemH, op, isDay, nat }: DandelionProps) {
	const sCol = isDay
		? `rgba(38,${Math.round(lerp(88, 115, nat))},32,1)`
		: 'rgba(14,36,12,1)';
	const pCol = isDay ? 'rgba(235,228,195,0.95)' : 'rgba(165,155,110,0.90)';
	const cx = s(x);
	const ty = s(y - stemH);
	return (
		<g
			opacity={op}
			style={{ transition: 'opacity 2.2s ease' }}
			shapeRendering='crispEdges'
		>
			<rect x={cx - 1} y={ty} width={2} height={s(stemH)} fill={sCol} />
			<rect x={cx - 1} y={ty - 6} width={2} height={6} fill={pCol} />
			<rect x={cx - 1} y={ty + 2} width={2} height={6} fill={pCol} />
			<rect x={cx - 7} y={ty - 1} width={6} height={2} fill={pCol} />
			<rect x={cx + 2} y={ty - 1} width={6} height={2} fill={pCol} />
			<rect x={cx - 5} y={ty - 5} width={2} height={2} fill={pCol} />
			<rect x={cx + 4} y={ty - 5} width={2} height={2} fill={pCol} />
			<rect x={cx - 5} y={ty + 4} width={2} height={2} fill={pCol} />
			<rect x={cx + 4} y={ty + 4} width={2} height={2} fill={pCol} />
			<rect
				x={cx - 1}
				y={ty - 1}
				width={2}
				height={2}
				fill='rgba(255,248,210,1)'
			/>
		</g>
	);
}

type PlacementTuple = [number, number, number, number];

const WEEDS_BEHIND: PlacementTuple[] = [
	[460, 375, 1.1, 0.0],
	[520, 405, 1.0, 0.18],
	[590, 438, 1.0, 0.28],
	[480, 452, 0.9, 0.42],
	[440, 418, 0.78, 0.35],
	[630, 430, 0.9, 0.28]
];
const WEEDS_FRONT: PlacementTuple[] = [
	[215, 380, 1.0, 0.0],
	[310, 395, 0.9, 0.0],
	[680, 385, 1.0, 0.0],
	[730, 372, 0.85, 0.0],
	[820, 390, 0.95, 0.0],
	[155, 410, 0.8, 0.18],
	[340, 418, 0.78, 0.35],
	[720, 415, 0.9, 0.18],
	[250, 445, 0.9, 0.28],
	[780, 428, 0.85, 0.35],
	[380, 430, 1.1, 0.28]
];
const DAND_BEHIND: PlacementTuple[] = [
	[495, 368, 18, 0.38],
	[555, 408, 20, 0.52],
	[475, 448, 14, 0.68]
];
const DAND_FRONT: PlacementTuple[] = [
	[268, 375, 22, 0.38],
	[652, 382, 20, 0.38],
	[758, 374, 24, 0.48],
	[332, 415, 16, 0.52],
	[700, 420, 18, 0.62],
	[848, 388, 20, 0.72]
];

export default function CampingScene({
	time,
	warmth,
	weather,
	nature
}: MoodVals) {
	const sky = computeSky(time, warmth);
	const t = n01(time);
	const w = n01(warmth);
	const r = n01(weather);
	const nat = n01(nature);

	const starOp = t > 0.58 ? clamp((t - 0.58) / 0.22, 0, 1) : 0;
	const moonOp = t > 0.63 ? clamp((t - 0.63) / 0.2, 0, 1) : 0;
	const sunOp = t < 0.68 ? 1 : clamp(1 - (t - 0.68) / 0.1, 0, 1);
	const sunX = s(120 + clamp(t / 0.72, 0, 1) * 660);
	const sunY = s(270 - Math.sin(clamp(t / 0.72, 0, 1) * Math.PI) * 240);
	const fireGlow = clamp(
		0.28 + w * 0.52 + (t > 0.68 ? ((t - 0.68) / 0.32) * 0.38 : 0),
		0,
		1
	);
	const cloudOp = 0.3 + r * 0.68;
	const snow = clamp((0.38 - w) / 0.38, 0, 1);
	const nightOver = Math.max(0, t - 0.62) * 0.62;
	const warmOver = Math.max(0, w - 0.55) * 0.13;
	const isDay = t < 0.68;

	const mBgR = isDay ? Math.round(lerp(108, 88, t * 0.5)) : 20;
	const mBgG = isDay ? Math.round(lerp(114, 94, t * 0.4)) : 14;
	const mBgB = isDay ? Math.round(lerp(158, 175, t * 0.3)) : 44;
	const mtnBg = `rgb(${mBgR},${mBgG},${mBgB})`;

	const mMidR = isDay ? Math.round(lerp(58, 44, t * 0.4)) : 12;
	const mMidG = isDay ? Math.round(lerp(84, 68, t * 0.3)) : 18;
	const mMidB = isDay ? Math.round(lerp(68, 58, r * 0.3)) : 32;
	const mtnMid = `rgb(${mMidR},${mMidG},${mMidB})`;

	const gR = Math.round(lerp(isDay ? 62 : 20, 78, w * 0.2));
	const gG = Math.round(lerp(isDay ? 88 : 28, 72, r * 0.2));
	const gB = Math.round(lerp(isDay ? 46 : 16, 34, w * 0.15));

	const tDark = isDay
		? `rgba(22,${Math.round(lerp(82, 104, nat))},22,1)`
		: 'rgba(8,18,8,1)';
	const tMid = isDay
		? `rgba(38,${Math.round(lerp(108, 134, nat))},38,1)`
		: 'rgba(14,30,12,1)';
	const tBright = isDay
		? `rgba(56,${Math.round(lerp(140, 165, nat))},52,1)`
		: 'rgba(20,42,18,1)';
	const trunkCol = isDay ? '#4a2a10' : '#1a0c04';

	const fireOr = `rgba(255,${Math.round(lerp(80, 152, fireGlow))},0,0.95)`;
	const fireYel = `rgba(255,${Math.round(lerp(160, 222, fireGlow))},20,0.88)`;
	const fireWht = `rgba(255,255,${Math.round(lerp(60, 212, fireGlow))},0.70)`;

	const tLR = Math.round(lerp(248, 108, t * 0.82)),
		tLG = Math.round(lerp(232, 82, t * 0.82)),
		tLB = Math.round(lerp(160, 24, t * 0.82));
	const tRR = Math.round(lerp(210, 88, t * 0.82)),
		tRG = Math.round(lerp(192, 62, t * 0.82)),
		tRB = Math.round(lerp(118, 18, t * 0.82));

	const cBase =
		r > 0.4
			? `rgba(185,208,232,0.92)`
			: isDay
				? `rgba(255,230,238,0.90)`
				: `rgba(200,212,242,0.85)`;
	const cMid = isDay ? `rgba(255,208,228,0.88)` : `rgba(178,196,238,0.80)`;
	const cHi = isDay ? `rgba(255,255,248,0.72)` : `rgba(218,228,255,0.65)`;
	const cloudPal: [string, string, string] = [cBase, cMid, cHi];

	const snowHi = `rgba(230,244,255,${snow})`;
	const snowMd = `rgba(210,230,250,${snow * 0.88})`;
	const vegOp = 1 - snow;
	const gCol = isDay
		? `rgba(38,${Math.round(lerp(88, 115, nat))},32,1)`
		: `rgba(16,${Math.round(lerp(42, 58, nat))},14,1)`;
	const gCol2 = isDay
		? `rgba(30,${Math.round(lerp(75, 100, nat))},26,0.88)`
		: `rgba(12,${Math.round(lerp(36, 50, nat))},10,0.88)`;

	const toPoints = (coords: number[]): string =>
		coords
			.reduce<string[]>((acc, v, i) => {
				if (i % 2 === 0) acc.push(`${v}`);
				else acc[acc.length - 1] += `,${v}`;
				return acc;
			}, [])
			.join(' ');

	const bgMtnCoords = [
		s(0),
		s(325),
		s(0),
		s(280),
		s(20),
		s(264),
		s(40),
		s(264),
		s(60),
		s(244),
		s(80),
		s(244),
		s(96),
		s(228),
		s(116),
		s(228),
		s(132),
		s(212),
		s(148),
		s(212),
		s(164),
		s(228),
		s(180),
		s(228),
		s(196),
		s(212),
		s(216),
		s(212),
		s(236),
		s(196),
		s(252),
		s(196),
		s(268),
		s(180),
		s(288),
		s(180),
		s(308),
		s(168),
		s(324),
		s(168),
		s(340),
		s(180),
		s(360),
		s(180),
		s(376),
		s(192),
		s(388),
		s(192),
		s(400),
		s(180),
		s(416),
		s(180),
		s(432),
		s(164),
		s(452),
		s(164),
		s(472),
		s(152),
		s(492),
		s(152),
		s(508),
		s(164),
		s(524),
		s(164),
		s(540),
		s(176),
		s(556),
		s(176),
		s(572),
		s(164),
		s(588),
		s(164),
		s(604),
		s(152),
		s(624),
		s(152),
		s(644),
		s(164),
		s(660),
		s(164),
		s(676),
		s(176),
		s(692),
		s(176),
		s(708),
		s(164),
		s(724),
		s(164),
		s(740),
		s(160),
		s(756),
		s(160),
		s(772),
		s(168),
		s(788),
		s(168),
		s(804),
		s(176),
		s(820),
		s(176),
		s(836),
		s(180),
		s(856),
		s(180),
		s(876),
		s(172),
		s(900),
		s(172),
		s(900),
		s(325)
	];

	const midMtnCoords = [
		s(0),
		s(325),
		s(0),
		s(312),
		s(16),
		s(296),
		s(36),
		s(296),
		s(56),
		s(280),
		s(76),
		s(280),
		s(92),
		s(268),
		s(108),
		s(268),
		s(124),
		s(280),
		s(144),
		s(280),
		s(160),
		s(268),
		s(176),
		s(268),
		s(196),
		s(256),
		s(212),
		s(256),
		s(228),
		s(248),
		s(248),
		s(248),
		s(264),
		s(256),
		s(284),
		s(256),
		s(300),
		s(248),
		s(316),
		s(248),
		s(332),
		s(256),
		s(352),
		s(256),
		s(368),
		s(264),
		s(388),
		s(264),
		s(404),
		s(256),
		s(420),
		s(248),
		s(440),
		s(248),
		s(460),
		s(256),
		s(476),
		s(256),
		s(492),
		s(244),
		s(512),
		s(244),
		s(532),
		s(256),
		s(548),
		s(256),
		s(564),
		s(264),
		s(584),
		s(264),
		s(600),
		s(256),
		s(616),
		s(256),
		s(632),
		s(248),
		s(652),
		s(248),
		s(668),
		s(256),
		s(688),
		s(256),
		s(704),
		s(264),
		s(720),
		s(264),
		s(740),
		s(256),
		s(756),
		s(256),
		s(772),
		s(260),
		s(792),
		s(260),
		s(808),
		s(256),
		s(828),
		s(256),
		s(848),
		s(260),
		s(868),
		s(260),
		s(900),
		s(258),
		s(900),
		s(325)
	];

	const tentRightPts = [
		`${s(392)},${s(278)}`,
		...Array.from({ length: 10 }, (_, i) => {
			const nx = s(392 + ((514 - 392) * (i + 1)) / 10);
			const cy1 = s(278 + ((382 - 278) * i) / 10);
			const cy2 = s(278 + ((382 - 278) * (i + 1)) / 10);
			return `${nx},${cy1} ${nx},${cy2}`;
		}),
		`${s(392)},${s(382)}`
	].join(' ');

	const tentLeftPts = [
		...stairSlope(10, 392, 278, 270, 382).map(([x, y]) => `${x},${y}`),
		`${s(392)},${s(382)}`
	].join(' ');

	return (
		<svg
			viewBox='0 0 900 550'
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				imageRendering: 'pixelated'
			}}
			preserveAspectRatio='xMidYMid slice'
		>
			<defs>
				<linearGradient id='skyG' x1='0' y1='0' x2='0' y2='1'>
					<stop
						offset='0%'
						stopColor={sky.top}
						style={{ transition: 'stop-color 1.8s ease' }}
					/>
					<stop
						offset='100%'
						stopColor={sky.bottom}
						style={{ transition: 'stop-color 1.8s ease' }}
					/>
				</linearGradient>
				<radialGradient id='fireG' cx='50%' cy='75%' r='55%'>
					<stop
						offset='0%'
						stopColor={`rgba(255,${Math.round(lerp(42, 130, fireGlow))},0,${fireGlow * 0.78})`}
					/>
					<stop offset='100%' stopColor='rgba(255,80,0,0)' />
				</radialGradient>
				<radialGradient id='tentG' cx='55%' cy='88%' r='42%'>
					<stop offset='0%' stopColor={`rgba(255,195,95,${w * 0.28})`} />
					<stop offset='100%' stopColor='rgba(255,140,40,0)' />
				</radialGradient>
				<linearGradient id='tentI' x1='0' y1='0' x2='0' y2='1'>
					<stop
						offset='0%'
						stopColor={`rgba(255,${Math.round(lerp(240, 135, 1 - fireGlow))},${Math.round(lerp(201, 30, 1 - fireGlow))},${0.18 + fireGlow * 0.42})`}
					/>
					<stop offset='100%' stopColor='rgba(255,160,60,0)' />
				</linearGradient>
				<radialGradient id='moonG' cx='50%' cy='50%' r='50%'>
					<stop offset='0%' stopColor='rgba(242,238,215,1)' />
					<stop offset='55%' stopColor='rgba(238,232,205,1)' />
					<stop offset='100%' stopColor='rgba(200,212,240,0)' />
				</radialGradient>
				<radialGradient id='sunG' cx='50%' cy='50%' r='50%'>
					<stop offset='0%' stopColor='rgba(255,248,210,1)' />
					<stop offset='42%' stopColor='rgba(255,235,160,0.62)' />
					<stop offset='100%' stopColor='rgba(255,210,80,0)' />
				</radialGradient>
				<linearGradient id='snowGloss' x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stopColor='rgba(255,255,255,0.52)' />
					<stop offset='18%' stopColor='rgba(240,248,255,0.28)' />
					<stop offset='100%' stopColor='rgba(210,230,250,0.04)' />
				</linearGradient>
				<filter id='ffGlow' x='-80%' y='-80%' width='260%' height='260%'>
					<feGaussianBlur stdDeviation='2.2' result='b' />
					<feMerge>
						<feMergeNode in='b' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
				<filter id='softGlow'>
					<feGaussianBlur stdDeviation='4' result='b' />
					<feMerge>
						<feMergeNode in='b' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
				<filter id='fireGlo' x='-50%' y='-50%' width='200%' height='200%'>
					<feGaussianBlur stdDeviation='6' result='b' />
					<feMerge>
						<feMergeNode in='b' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
				<clipPath id='clip'>
					<rect width='900' height='550' />
				</clipPath>
			</defs>

			<g clipPath='url(#clip)'>
				{/* Sky */}
				<rect
					width='900'
					height='325'
					fill='url(#skyG)'
					shapeRendering='crispEdges'
				/>

				{/* Stars */}
				<g
					opacity={starOp}
					style={{ transition: 'opacity 2.2s ease' }}
					shapeRendering='crispEdges'
				>
					{STARS.map(([sx, sy], i) => {
						const big = i % 7 === 0;
						return big ? (
							<g key={i}>
								<rect
									x={s(sx) - P}
									y={s(sy) - P * 2}
									width={P * 2}
									height={P * 4}
									fill='rgba(255,255,255,0.88)'
								/>
								<rect
									x={s(sx) - P * 2}
									y={s(sy) - P}
									width={P * 4}
									height={P * 2}
									fill='rgba(255,255,255,0.88)'
								/>
								<rect
									x={s(sx) - P}
									y={s(sy) - P}
									width={P * 2}
									height={P * 2}
									fill='rgba(255,255,228,1)'
								/>
							</g>
						) : (
							<rect
								key={i}
								x={s(sx) - P / 2}
								y={s(sy) - P / 2}
								width={P}
								height={P}
								fill='white'
								opacity={0.55 + (i % 5) * 0.09}
							>
								<animate
									attributeName='opacity'
									values={`${0.55 + (i % 5) * 0.09};1;${0.55 + (i % 5) * 0.09}`}
									dur={`${2 + (i % 4) * 0.8}s`}
									repeatCount='indefinite'
								/>
							</rect>
						);
					})}
				</g>

				{/* Moon */}
				<g
					opacity={moonOp}
					style={{ transition: 'opacity 2s ease' }}
					shapeRendering='crispEdges'
				>
					<rect
						x={768}
						y={40}
						width={60}
						height={60}
						fill='rgba(240,235,210,0.08)'
					/>
					<rect
						x={776}
						y={48}
						width={36}
						height={36}
						fill='rgba(244,240,218,1)'
					/>
					<rect
						x={776}
						y={48}
						width={12}
						height={P}
						fill='rgba(255,252,240,0.80)'
					/>
					<rect
						x={780}
						y={56}
						width={P}
						height={P}
						fill='rgba(198,192,172,0.45)'
					/>
					<rect
						x={796}
						y={68}
						width={P}
						height={P}
						fill='rgba(198,192,172,0.35)'
					/>
					<rect
						x={788}
						y={72}
						width={P}
						height={P}
						fill='rgba(198,192,172,0.28)'
					/>
				</g>

				{/* Sun */}
				<g
					opacity={sunOp}
					style={{ transition: 'opacity 1s ease' }}
					shapeRendering='crispEdges'
				>
					<rect
						x={sunX - P}
						y={sunY - 28}
						width={P * 2}
						height={12}
						fill='rgba(255,220,48,0.85)'
					/>
					<rect
						x={sunX - P}
						y={sunY + 16}
						width={P * 2}
						height={12}
						fill='rgba(255,220,48,0.85)'
					/>
					<rect
						x={sunX - 28}
						y={sunY - P}
						width={12}
						height={P * 2}
						fill='rgba(255,220,48,0.85)'
					/>
					<rect
						x={sunX + 16}
						y={sunY - P}
						width={12}
						height={P * 2}
						fill='rgba(255,220,48,0.85)'
					/>
					<rect
						x={sunX - 12}
						y={sunY - 12}
						width={24}
						height={24}
						fill={`rgb(255,${Math.round(lerp(210, 245, w))},${Math.round(lerp(48, 148, w))})`}
						style={{ transition: 'fill 1.5s ease' }}
					/>
					<rect
						x={sunX - 12}
						y={sunY - 12}
						width={8}
						height={8}
						fill='rgba(255,255,215,0.60)'
					/>
				</g>

				{/* Clouds */}
				<g>
					<animateTransform
						attributeName='transform'
						type='translate'
						values='0,0;100,0;0,0'
						dur='34s'
						repeatCount='indefinite'
						calcMode='spline'
						keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						additive='sum'
					/>
					<Cloud cx={120} cy={110} op={cloudOp} pal={cloudPal} />
				</g>
				<g>
					<animateTransform
						attributeName='transform'
						type='translate'
						values='0,0;80,0;0,0'
						dur='24s'
						repeatCount='indefinite'
						calcMode='spline'
						keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						additive='sum'
					/>
					<Cloud cx={580} cy={88} op={cloudOp * 0.85} pal={cloudPal} />
				</g>
				<g>
					<animateTransform
						attributeName='transform'
						type='translate'
						values='0,0;60,0;0,0'
						dur='28s'
						repeatCount='indefinite'
						calcMode='spline'
						keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						additive='sum'
					/>
					<Cloud cx={795} cy={118} op={cloudOp * 0.6} pal={cloudPal} />
				</g>

				{/* Background Mountains */}
				<polygon
					fill={mtnBg}
					shapeRendering='crispEdges'
					style={{ transition: 'fill 2s ease' }}
					points={toPoints(bgMtnCoords)}
				/>

				{/* Snow on background mountains */}
				<polygon
					opacity={snow}
					fill={snowHi}
					shapeRendering='crispEdges'
					style={{ transition: 'opacity 2.2s ease' }}
					points={snowBand(bgMtnCoords, 284, 10)}
				/>

				{/* ── Foreground mountains ── */}
				<polygon
					fill={mtnMid}
					shapeRendering='crispEdges'
					style={{ transition: 'fill 2s ease' }}
					points={toPoints(midMtnCoords)}
				/>

				{/* Snow on foreground mountains */}
				<polygon
					opacity={snow}
					fill={snowMd}
					shapeRendering='crispEdges'
					style={{ transition: 'opacity 2.2s ease' }}
					points={snowBand(midMtnCoords, 314, 8)}
				/>

				{/* Ground */}
				<rect
					x={0}
					y={315}
					width={900}
					height={235}
					fill={`rgb(${gR},${gG},${gB})`}
					shapeRendering='crispEdges'
					style={{ transition: 'fill 2s ease' }}
				/>

				{/* Snow on ground cover */}
				<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
					<rect
						x={0}
						y={316}
						width={900}
						height={235}
						fill={`rgba(218,232,248,${snow * 0.88})`}
					/>
					<ellipse
						cx={450}
						cy={317}
						rx={490}
						ry={11}
						fill='rgba(238,246,255,0.72)'
					/>
					<rect x={0} y={316} width={900} height={100} fill='url(#snowGloss)' />
				</g>

				{/* Horizon shadow */}
				<rect
					x={0}
					y={316}
					width={900}
					height={P}
					fill={`rgba(0,0,0,${isDay ? 0.1 : 0.22})`}
					shapeRendering='crispEdges'
					style={{ transition: 'fill 2s ease' }}
				/>

				{/* Rocks */}
				{(
					[
						[148, 328, 28, 14],
						[184, 324, 20, 10],
						[220, 328, 16, 8],
						[476, 325, 20, 10],
						[512, 322, 28, 14],
						[548, 326, 16, 8],
						[680, 325, 22, 11],
						[712, 327, 16, 8],
						[748, 323, 26, 13],
						[328, 326, 14, 7],
						[360, 324, 18, 9]
					] as [number, number, number, number][]
				).map(([rx, ry, rw, rh], i) => {
					const rc = isDay
						? `rgba(${108 + i * 5},${106 + i * 4},${126 + i * 4},0.92)`
						: 'rgba(38,34,54,0.94)';
					const rhi = isDay
						? `rgba(${150 + i * 3},${146 + i * 2},${162 + i * 2},0.70)`
						: 'rgba(56,50,72,0.60)';
					return (
						<g
							key={i}
							shapeRendering='crispEdges'
							style={{ transition: 'fill 2s ease' }}
						>
							<rect
								x={s(rx - rw / 2)}
								y={s(ry)}
								width={s(rw)}
								height={s(rh)}
								fill={rc}
							/>
							<rect
								x={s(rx - rw / 2)}
								y={s(ry)}
								width={s(rw)}
								height={P}
								fill={rhi}
							/>
							<rect
								x={s(rx - rw / 2)}
								y={s(ry + rh - P)}
								width={s(rw)}
								height={P}
								fill='rgba(0,0,0,0.12)'
							/>
						</g>
					);
				})}

				{/* Weeds behind tent */}
				{WEEDS_BEHIND.map(([x, y, sc, min], i) => (
					<Weed
						key={i}
						x={x}
						y={y}
						sc={sc}
						op={clamp((nat - min) / 0.22, 0, 1) * vegOp}
						gCol={gCol}
						gCol2={gCol2}
					/>
				))}
				{DAND_BEHIND.map(([x, y, sh, min], i) => (
					<Dandelion
						key={i}
						x={x}
						y={y}
						stemH={sh}
						op={clamp((nat - min) / 0.18, 0, 1) * vegOp}
						isDay={isDay}
						nat={nat}
					/>
				))}

				{/* Trees on the left */}
				<Tree
					cx={98}
					base={318}
					sc={1.12}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>
				<Tree
					cx={48}
					base={318}
					sc={0.8}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>
				<Tree
					cx={172}
					base={318}
					sc={0.7}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>

				{/* Trees on the right */}
				<Tree
					cx={802}
					base={318}
					sc={1.12}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>
				<Tree
					cx={856}
					base={318}
					sc={0.8}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>
				<Tree
					cx={730}
					base={318}
					sc={0.7}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>

				{/* Main tree */}
				<Tree
					cx={460}
					base={318}
					sc={1.6}
					dark={tDark}
					mid={tMid}
					bright={tBright}
					trunk={trunkCol}
					snow={snow}
				/>

				<g transform='translate(140,0)' shapeRendering='crispEdges'>
					{/* Tent faces */}
					<polygon
						points={tentLeftPts}
						fill={`rgb(${tLR},${tLG},${tLB})`}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points={tentRightPts}
						fill={`rgb(${tRR},${tRG},${tRB})`}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points={stairTri(392, 320, 382, 22, 4)}
						fill={isDay ? 'rgba(38,28,8,0.88)' : 'rgba(8,6,2,0.96)'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points={stairTri(392, 300, 382, 26, 4)}
						fill={`rgba(255,${Math.round(lerp(228, 118, 1 - fireGlow))},${Math.round(lerp(188, 22, 1 - fireGlow))},${0.18 + fireGlow * 0.44})`}
						style={{ transition: 'fill 2s ease' }}
					/>

					{/* Tent strings */}
					<line
						x1={270}
						y1={382}
						x2={220}
						y2={400}
						stroke={isDay ? 'rgba(148,128,98,0.55)' : 'rgba(78,68,48,0.50)'}
						strokeWidth='2'
						style={{ transition: 'stroke 2s ease' }}
					/>
					<line
						x1={514}
						y1={382}
						x2={562}
						y2={400}
						stroke={isDay ? 'rgba(148,128,98,0.55)' : 'rgba(78,68,48,0.50)'}
						strokeWidth='2'
						style={{ transition: 'stroke 2s ease' }}
					/>
					<line
						x1={220}
						y1={400}
						x2={218}
						y2={412}
						stroke={isDay ? 'rgba(138,108,78,0.68)' : 'rgba(68,52,38,0.62)'}
						strokeWidth='2.5'
					/>
					<line
						x1={562}
						y1={400}
						x2={564}
						y2={412}
						stroke={isDay ? 'rgba(138,108,78,0.68)' : 'rgba(68,52,38,0.62)'}
						strokeWidth='2.5'
					/>

					{/* Fire glow */}
					<ellipse
						cx={578}
						cy={405}
						rx={88 * fireGlow}
						ry={42 * fireGlow}
						fill='url(#fireG)'
						style={{ transition: 'rx 1.2s ease, ry 1.2s ease' }}
					/>

					{/* Logs */}
					<rect
						x={s(548)}
						y={s(416)}
						width={s(60)}
						height={s(8)}
						fill={isDay ? '#6b4828' : '#3a2010'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<rect
						x={s(552)}
						y={s(412)}
						width={s(52)}
						height={s(6)}
						fill={isDay ? '#7a5a2e' : '#4a2a12'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<ellipse
						cx={578}
						cy={420}
						rx={28}
						ry={7}
						fill={isDay ? '#5a3618' : '#2a180a'}
						style={{ transition: 'fill 2s ease' }}
					/>

					{/* Flames */}
					<g filter='url(#softGlow)'>
						<rect
							x={s(558)}
							y={s(408)}
							width={s(40)}
							height={s(12)}
							fill={fireOr}
						>
							<animate
								attributeName='opacity'
								values='0.90;1.00;0.82;0.90'
								dur='0.72s'
								repeatCount='indefinite'
							/>
						</rect>
						<rect
							x={s(562)}
							y={s(396)}
							width={s(32)}
							height={s(12)}
							fill={fireYel}
						>
							<animate
								attributeName='opacity'
								values='0.85;1.00;0.68;0.85'
								dur='0.60s'
								repeatCount='indefinite'
								begin='0.08s'
							/>
						</rect>
						<rect
							x={s(566)}
							y={s(384)}
							width={s(24)}
							height={s(12)}
							fill={fireYel}
						>
							<animate
								attributeName='opacity'
								values='0.72;0.92;0.50;0.72'
								dur='0.85s'
								repeatCount='indefinite'
								begin='0.04s'
							/>
						</rect>
						<rect
							x={s(570)}
							y={s(376)}
							width={s(16)}
							height={s(8)}
							fill={fireWht}
						>
							<animate
								attributeName='opacity'
								values='0.60;0.88;0.40;0.60'
								dur='0.52s'
								repeatCount='indefinite'
								begin='0.12s'
							/>
						</rect>
						<rect
							x={s(550)}
							y={s(402)}
							width={P * 2}
							height={s(12)}
							fill={fireOr}
						>
							<animate
								attributeName='opacity'
								values='0.55;0.80;0.28;0.55'
								dur='0.90s'
								repeatCount='indefinite'
								begin='0.30s'
							/>
						</rect>
						<rect
							x={s(592)}
							y={s(402)}
							width={P * 2}
							height={s(12)}
							fill={fireYel}
						>
							<animate
								attributeName='opacity'
								values='0.48;0.78;0.32;0.48'
								dur='1.05s'
								repeatCount='indefinite'
								begin='0.18s'
							/>
						</rect>
					</g>

					{/* Smoke */}
					{[0, 1, 2].map((i) => (
						<rect
							key={i}
							x={s(570 + (i - 1) * 6)}
							y={s(372)}
							width={P * 2}
							height={P * 2}
							fill={`rgba(${Math.round(lerp(148, 70, t))},${Math.round(lerp(148, 70, t))},${Math.round(lerp(162, 80, t))},0.20)`}
						>
							<animate
								attributeName='y'
								values={`${s(372)};${s(340)};${s(304)}`}
								dur={`${2.4 + i * 0.8}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='opacity'
								values='0.22;0.12;0'
								dur={`${2.4 + i * 0.8}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='width'
								values={`${P * 2};${P * 3};${P * 4}`}
								dur={`${2.4 + i * 0.8}s`}
								repeatCount='indefinite'
							/>
						</rect>
					))}
				</g>

				{/* Front weeds */}
				<g transform='translate(140,0)'>
					{WEEDS_FRONT.map(([x, y, sc, min], i) => (
						<Weed
							key={i}
							x={x}
							y={y}
							sc={sc}
							op={clamp((nat - min) / 0.22, 0, 1) * vegOp}
							gCol={gCol}
							gCol2={gCol2}
						/>
					))}
					{DAND_FRONT.map(([x, y, sh, min], i) => (
						<Dandelion
							key={i}
							x={x}
							y={y}
							stemH={sh}
							op={clamp((nat - min) / 0.18, 0, 1) * vegOp}
							isDay={isDay}
							nat={nat}
						/>
					))}
				</g>

				{/* Fireflies */}
				<g
					opacity={nat > 0.28 ? 1 : 0}
					style={{ transition: 'opacity 2s ease' }}
				>
					{FIREFLIES.map((ff, i) => (
						<rect
							key={i}
							x={s(ff.x) - P / 2}
							y={s(ff.y) - P / 2}
							width={P}
							height={P}
							fill={`rgba(${Math.round(lerp(172, 238, nat))},${Math.round(lerp(218, 255, nat))},${Math.round(lerp(72, 115, nat))},0.9)`}
							shapeRendering='crispEdges'
						>
							<animate
								attributeName='opacity'
								values={`0;${nat * 0.88};0`}
								dur={`${ff.dur}s`}
								begin={`${ff.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='y'
								values={`${s(ff.y) - P / 2};${s(ff.y - 8) - P / 2};${s(ff.y) - P / 2}`}
								dur={`${parseFloat(ff.dur) * 1.6}s`}
								begin={`${ff.delay}s`}
								repeatCount='indefinite'
							/>
						</rect>
					))}
				</g>

				{/* Rain */}
				<g opacity={r} style={{ transition: 'opacity 2s ease' }}>
					{RAIN.map((drop, i) => (
						<rect
							key={i}
							x={s(drop.x)}
							y={-8}
							width={2}
							height={P * 3}
							fill='rgba(148,196,232,0.58)'
							shapeRendering='crispEdges'
						>
							<animate
								attributeName='y'
								values='-8;560'
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='x'
								values={`${s(drop.x)};${s(drop.x + 8)}`}
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
						</rect>
					))}
				</g>
				<rect
					width='900'
					height='550'
					fill={`rgba(4,2,18,${nightOver})`}
					style={{ transition: 'fill 2s ease', pointerEvents: 'none' }}
					shapeRendering='crispEdges'
				/>
				<rect
					width='900'
					height='550'
					fill={`rgba(255,138,28,${warmOver})`}
					style={{ transition: 'fill 1.8s ease', pointerEvents: 'none' }}
					shapeRendering='crispEdges'
				/>
				<rect
					width='900'
					height='550'
					fill={`rgba(60,90,140,${r * 0.08})`}
					style={{ transition: 'fill 2s ease', pointerEvents: 'none' }}
					shapeRendering='crispEdges'
				/>
			</g>
		</svg>
	);
}
