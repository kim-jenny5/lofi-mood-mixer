import { lerp, clamp, n01, computeSky } from './utils';
import { STARS, FIREFLIES, RAIN } from './constants';
import type { MoodVals } from './constants';

// ─── Snow geometry helpers ─────────────────────────────────────────────────────

function peakSnow(
	lx: number,
	ly: number,
	px: number,
	py: number,
	rx: number,
	ry: number,
	depth = 0.44
): string {
	const slx = +(px + (lx - px) * depth).toFixed(1);
	const sly = +(py + (ly - py) * depth).toFixed(1);
	const srx = +(px + (rx - px) * depth).toFixed(1);
	const sry = +(py + (ry - py) * depth).toFixed(1);
	const qy = +(Math.max(sly, sry) + 6).toFixed(1);
	return `M ${slx},${sly} Q ${px},${py} ${srx},${sry} Q ${px},${qy} ${slx},${sly} Z`;
}

function tierSnow(
	tx: number,
	ty: number,
	lx: number,
	rx: number,
	by: number,
	frac = 0.46
): string {
	const sy = +(ty + (by - ty) * frac).toFixed(1);
	const dt = (+sy - ty) / (by - ty);
	const slx = +(tx + (lx - tx) * dt).toFixed(1);
	const srx = +(tx + (rx - tx) * dt).toFixed(1);
	return `M ${tx},${ty} L ${srx},${sy} Q ${tx},${+(+sy + 5).toFixed(1)} ${slx},${sy} Z`;
}

const SF = 'rgba(235,244,254,0.93)';
const SF2 = 'rgba(220,234,250,0.85)';

// ─── Vegetation sub-components ─────────────────────────────────────────────────

interface TuftProps {
	x: number;
	y: number;
	sc: number;
	op: number;
	gCol: string;
	gCol2: string;
}

function Tuft({ x, y, sc, op, gCol, gCol2 }: TuftProps) {
	return (
		<g
			transform={`translate(${x},${y}) scale(${sc})`}
			opacity={op}
			style={{ transition: 'opacity 2s ease' }}
		>
			<path
				d='M0,0 Q-5,-9 -7,-14'
				stroke={gCol}
				strokeWidth='2'
				fill='none'
				strokeLinecap='round'
			/>
			<path
				d='M0,0 Q-2,-10 -1,-16'
				stroke={gCol}
				strokeWidth='2.2'
				fill='none'
				strokeLinecap='round'
			/>
			<path
				d='M0,0 Q2,-10 3,-16'
				stroke={gCol}
				strokeWidth='2.2'
				fill='none'
				strokeLinecap='round'
			/>
			<path
				d='M0,0 Q5,-9 8,-14'
				stroke={gCol}
				strokeWidth='2'
				fill='none'
				strokeLinecap='round'
			/>
			<path
				d='M0,0 Q8,-6 12,-9'
				stroke={gCol2}
				strokeWidth='1.6'
				fill='none'
				strokeLinecap='round'
			/>
			<path
				d='M0,0 Q-8,-6 -12,-9'
				stroke={gCol2}
				strokeWidth='1.6'
				fill='none'
				strokeLinecap='round'
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
	const dCol = isDay ? 'rgba(195,185,145,0.88)' : 'rgba(110,100,70,0.78)';
	const sCol = isDay
		? `rgba(38,${Math.round(lerp(88, 115, nat))},32,0.9)`
		: 'rgba(14,36,12,0.9)';
	const centre = isDay ? 'rgba(230,218,170,0.9)' : 'rgba(130,118,80,0.8)';
	return (
		<g opacity={op} style={{ transition: 'opacity 2.2s ease' }}>
			<path
				d={`M${x},${y} Q${x + 3},${y - stemH * 0.5} ${x},${y - stemH}`}
				stroke={sCol}
				strokeWidth='1.5'
				fill='none'
				strokeLinecap='round'
			/>
			{Array.from({ length: 12 }, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				const bx = x + Math.cos(a) * 7;
				const by = y - stemH + Math.sin(a) * 7;
				return (
					<g key={i}>
						<line
							x1={x}
							y1={y - stemH}
							x2={bx}
							y2={by}
							stroke={dCol}
							strokeWidth='0.9'
							opacity='0.72'
						/>
						<circle cx={bx} cy={by} r={1.6} fill={dCol} opacity='0.62' />
					</g>
				);
			})}
			<circle cx={x} cy={y - stemH} r={2.2} fill={centre} />
		</g>
	);
}

// Placement data: [x, y, scale, minNat]
type PlacementTuple = [number, number, number, number];

const TUFTS_BEHIND: PlacementTuple[] = [
	[460, 375, 1.1, 0.0],
	[520, 405, 1.0, 0.18],
	[590, 438, 1.0, 0.28],
	[480, 452, 0.9, 0.42],
	[440, 418, 0.78, 0.35],
	[630, 430, 0.9, 0.28]
];
const TUFTS_FRONT: PlacementTuple[] = [
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
// [x, y, stemH, minNat]
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

// ─── Main scene component ──────────────────────────────────────────────────────

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
	const sunX = 120 + clamp(t / 0.72, 0, 1) * 660;
	const sunY = 275 - Math.sin(clamp(t / 0.72, 0, 1) * Math.PI) * 240;
	const fireGlow = clamp(
		0.28 + w * 0.52 + (t > 0.68 ? ((t - 0.68) / 0.32) * 0.38 : 0),
		0,
		1
	);
	const cloudOp = 0.25 + r * 0.72;
	const snow = clamp((0.38 - w) / 0.38, 0, 1);
	const nightOver = Math.max(0, t - 0.62) * 0.62;
	const warmOver = Math.max(0, w - 0.55) * 0.13;

	const gR = Math.round(lerp(t < 0.68 ? 62 : 20, 80, w * 0.3));
	const gG = Math.round(lerp(t < 0.68 ? 88 : 28, 78, r * 0.25));
	const gB = Math.round(lerp(t < 0.68 ? 48 : 18, 40, w * 0.2));

	const mtBg = t < 0.68 ? 'rgba(95,125,145,0.62)' : 'rgba(18,12,38,0.92)';
	const mtMid = t < 0.68 ? 'rgba(65,100,75,0.82)' : 'rgba(12,18,32,0.96)';
	const fireR = Math.round(lerp(42, 130, fireGlow));
	const isDay = t < 0.68;

	const vegOp = 1 - snow;
	const gCol = isDay
		? `rgba(38,${Math.round(lerp(88, 115, nat))},32,1)`
		: `rgba(16,${Math.round(lerp(42, 58, nat))},14,1)`;
	const gCol2 = isDay
		? `rgba(30,${Math.round(lerp(75, 100, nat))},26,0.88)`
		: `rgba(12,${Math.round(lerp(36, 50, nat))},10,0.88)`;

	const cR = Math.round(lerp(238, 172, r * 0.55));
	const cG = Math.round(lerp(246, 182, r * 0.55));
	const cB = Math.round(lerp(255, 200, r * 0.55));
	const cf = (a: number) => `rgba(${cR},${cG},${cB},${a})`;
	const cf2 = (a: number) =>
		`rgba(${Math.round(cR * 0.97)},${Math.round(cG * 0.97)},${Math.round(cB * 0.99)},${a})`;

	interface CloudProps {
		tx: number;
		ty: number;
		sc: number;
	}
	const Cloud = ({ tx, ty, sc }: CloudProps) => (
		<g
			transform={`translate(${tx},${ty}) scale(${sc})`}
			style={{ transition: 'opacity 2s ease' }}
			opacity={cloudOp}
		>
			<ellipse
				cx='180'
				cy='148'
				rx='90'
				ry='22'
				fill={cf(0.08)}
				filter='url(#cloudBlurSoft)'
			/>
			<g filter='url(#cloudBlurMed)'>
				<ellipse cx='118' cy='102' rx='38' ry='30' fill={cf(0.38)} />
				<ellipse cx='155' cy='84' rx='44' ry='34' fill={cf(0.42)} />
				<ellipse cx='205' cy='82' rx='42' ry='32' fill={cf(0.42)} />
				<ellipse cx='246' cy='100' rx='35' ry='27' fill={cf(0.36)} />
				<ellipse cx='182' cy='106' rx='88' ry='40' fill={cf(0.3)} />
			</g>
			<path
				d='M86 124 C74 102,84 73,113 72 C119 50,142 39,164 48 C176 29,204 28,220 44 C247 38,271 52,278 76 C299 81,311 99,304 118 C297 136,278 145,252 144 C252 144,118 145,108 144 C92 143,78 137,86 124Z'
				fill={cf(0.82)}
				filter='url(#cloudBloom)'
			/>
			<g filter='url(#cloudBlurMed)'>
				<ellipse cx='115' cy='98' rx='29' ry='22' fill={cf2(0.35)} />
				<ellipse cx='146' cy='82' rx='35' ry='26' fill={cf2(0.42)} />
				<ellipse cx='190' cy='78' rx='34' ry='25' fill={cf2(0.4)} />
				<ellipse cx='229' cy='92' rx='31' ry='23' fill={cf2(0.36)} />
				<ellipse cx='174' cy='104' rx='76' ry='33' fill={cf2(0.28)} />
			</g>
			<g filter='url(#cloudBlurSoft)'>
				<path
					d='M108 124 C132 133,208 136,252 126'
					stroke={`rgba(${Math.round(lerp(185, 140, r * 0.5))},${Math.round(lerp(200, 155, r * 0.5))},${Math.round(lerp(220, 175, r * 0.5))},0.22)`}
					strokeWidth='13'
					strokeLinecap='round'
					fill='none'
				/>
			</g>
			<g filter='url(#cloudBlurMed)'>
				<path
					d='M112 76 C126 64,143 59,158 62'
					stroke={cf2(0.48)}
					strokeWidth='7'
					strokeLinecap='round'
					fill='none'
				/>
				<path
					d='M184 60 C200 56,219 60,232 71'
					stroke={cf2(0.38)}
					strokeWidth='6'
					strokeLinecap='round'
					fill='none'
				/>
				<path
					d='M100 102 C117 95,129 94,142 98'
					stroke={cf2(0.32)}
					strokeWidth='6'
					strokeLinecap='round'
					fill='none'
				/>
			</g>
			<g filter='url(#cloudBlurSoft)'>
				<circle cx='104' cy='113' r='10' fill={cf(0.18)} />
				<circle cx='148' cy='63' r='12' fill={cf(0.14)} />
				<circle cx='221' cy='68' r='9' fill={cf(0.14)} />
				<circle cx='255' cy='106' r='11' fill={cf(0.12)} />
			</g>
		</g>
	);

	return (
		<svg
			viewBox='0 0 900 550'
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
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
						stopColor={`rgba(255,${fireR},0,${fireGlow * 0.78})`}
					/>
					<stop offset='100%' stopColor='rgba(255,80,0,0)' />
				</radialGradient>
				<radialGradient id='tentG' cx='55%' cy='88%' r='42%'>
					<stop offset='0%' stopColor={`rgba(255,195,95,${w * 0.28})`} />
					<stop offset='100%' stopColor='rgba(255,140,40,0)' />
				</radialGradient>
				<linearGradient id='tentL' x1='0' y1='0' x2='1' y2='0'>
					<stop
						offset='0%'
						stopColor={`rgb(${Math.round(lerp(252, 72, t * 0.82))},${Math.round(lerp(242, 58, t * 0.82))},${Math.round(lerp(168, 22, t * 0.82))})`}
					/>
					<stop
						offset='100%'
						stopColor={`rgb(${Math.round(lerp(255, 88, t * 0.82))},${Math.round(lerp(248, 70, t * 0.82))},${Math.round(lerp(185, 28, t * 0.82))})`}
					/>
				</linearGradient>
				<linearGradient id='tentR' x1='0' y1='0' x2='1' y2='0'>
					<stop
						offset='0%'
						stopColor={`rgb(${Math.round(lerp(255, 82, t * 0.82))},${Math.round(lerp(245, 65, t * 0.82))},${Math.round(lerp(178, 24, t * 0.82))})`}
					/>
					<stop
						offset='100%'
						stopColor={`rgb(${Math.round(lerp(238, 55, t * 0.82))},${Math.round(lerp(210, 42, t * 0.82))},${Math.round(lerp(135, 16, t * 0.82))})`}
					/>
				</linearGradient>
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
				<radialGradient id='snowSpec' cx='38%' cy='8%' r='48%'>
					<stop offset='0%' stopColor='rgba(255,255,255,0.68)' />
					<stop offset='40%' stopColor='rgba(240,248,255,0.22)' />
					<stop offset='100%' stopColor='rgba(220,236,252,0)' />
				</radialGradient>
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
				<filter id='snowBlur' x='-5%' y='-5%' width='110%' height='110%'>
					<feGaussianBlur stdDeviation='1.8' />
				</filter>
				<filter id='cloudBlurSoft' x='-30%' y='-30%' width='160%' height='160%'>
					<feGaussianBlur stdDeviation='5.5' />
				</filter>
				<filter id='cloudBlurMed' x='-30%' y='-30%' width='160%' height='160%'>
					<feGaussianBlur stdDeviation='3' />
				</filter>
				<filter id='cloudBloom' x='-30%' y='-30%' width='160%' height='160%'>
					<feGaussianBlur stdDeviation='2.2' result='blur' />
					<feColorMatrix
						in='blur'
						type='matrix'
						values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.72 0'
					/>
				</filter>
				<clipPath id='clip'>
					<rect width='900' height='550' />
				</clipPath>
			</defs>

			<g clipPath='url(#clip)'>
				{/* ── Sky ── */}
				<rect
					width='900'
					height='325'
					fill='url(#skyG)'
					style={{ transition: 'fill 1.8s ease' }}
				/>

				{/* ── Stars ── */}
				<g style={{ transition: 'opacity 2.2s ease' }} opacity={starOp}>
					{STARS.map(([sx, sy], i) => (
						<circle
							key={i}
							cx={sx}
							cy={sy}
							r={0.7 + (i % 4) * 0.38}
							fill='white'
							opacity={0.55 + (i % 6) * 0.075}
						>
							<animate
								attributeName='opacity'
								values={`${0.55 + (i % 6) * 0.075};1;${0.55 + (i % 6) * 0.075}`}
								dur={`${1.8 + (i % 4) * 0.7}s`}
								repeatCount='indefinite'
							/>
						</circle>
					))}
				</g>

				{/* ── Moon ── */}
				<g style={{ transition: 'opacity 2s ease' }} opacity={moonOp}>
					<circle cx={798} cy={68} r={34} fill='url(#moonG)' />
					<circle cx={798} cy={68} r={21} fill='rgba(242,238,215,1)' />
					<circle cx={790} cy={60} r={3.2} fill='rgba(200,195,175,0.42)' />
					<circle cx={803} cy={74} r={2.1} fill='rgba(200,195,175,0.35)' />
					<circle cx={795} cy={77} r={1.6} fill='rgba(200,195,175,0.28)' />
				</g>

				{/* ── Sun ── */}
				<g style={{ transition: 'opacity 1s ease' }} opacity={sunOp}>
					<circle cx={sunX} cy={sunY} fill='url(#sunG)'>
						<animate
							attributeName='r'
							values='40;52;40'
							dur='5.2s'
							repeatCount='indefinite'
							calcMode='spline'
							keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						/>
					</circle>
					<circle cx={sunX} cy={sunY} fill='url(#sunG)' opacity='0.55'>
						<animate
							attributeName='r'
							values='28;36;28'
							dur='3.1s'
							repeatCount='indefinite'
							calcMode='spline'
							keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
							begin='-1.4s'
						/>
					</circle>
					<circle
						cx={sunX}
						cy={sunY}
						r={22}
						fill={`rgb(255,${Math.round(lerp(205, 242, w))},${Math.round(lerp(52, 148, w))})`}
						style={{ transition: 'fill 1.5s ease' }}
					/>
				</g>

				{/* ── Clouds ── */}
				<g>
					<animateTransform
						attributeName='transform'
						type='translate'
						values='0,0; 110,0; 0,0'
						dur='32s'
						repeatCount='indefinite'
						calcMode='spline'
						keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						additive='sum'
					/>
					<Cloud tx={-18} ty={52} sc={0.66} />
				</g>
				<g>
					<animateTransform
						attributeName='transform'
						type='translate'
						values='0,0; 85,0; 0,0'
						dur='22s'
						repeatCount='indefinite'
						calcMode='spline'
						keySplines='0.45 0 0.55 1;0.45 0 0.55 1'
						additive='sum'
					/>
					<Cloud tx={490} ty={42} sc={0.6} />
				</g>

				{/* ── Background mountains ── */}
				<path
					d='M 0,285 L 49,225 Q 75,192 129,215 L 158,228 L 217,185 Q 248,162 307,188 L 338,202 L 393,170 Q 422,152 481,179 L 512,194 L 571,167 Q 602,152 654,172 L 682,183 L 734,171 Q 762,164 809,181 L 835,190 L 900,172 L 900,325 L 0,325 Z'
					fill={mtBg}
					style={{ transition: 'fill 2s ease' }}
				/>
				<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
					<path d={peakSnow(0, 285, 75, 192, 158, 228, 0.4)} fill={SF} />
					<path d={peakSnow(158, 228, 248, 162, 338, 202, 0.44)} fill={SF} />
					<path d={peakSnow(338, 202, 422, 152, 512, 194, 0.44)} fill={SF} />
					<path d={peakSnow(512, 194, 602, 152, 682, 183, 0.44)} fill={SF} />
					<path d={peakSnow(682, 183, 762, 164, 835, 190, 0.48)} fill={SF} />
					<path d={peakSnow(835, 190, 900, 172, 900, 325, 0.1)} fill={SF} />
				</g>

				{/* ── Mid mountains ── */}
				<path
					d='M 0,312 L 38,283 Q 58,268 104,284 L 128,292 L 187,266 Q 218,252 277,265 L 308,272 L 354,256 Q 378,248 430,261 L 458,268 L 510,251 Q 538,242 590,255 L 618,262 L 679,254 Q 712,250 764,263 L 792,270 L 838,262 Q 862,258 887,262 L 900,264 L 900,325 L 0,325 Z'
					fill={mtMid}
					style={{ transition: 'fill 2s ease' }}
				/>
				<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
					<path d={peakSnow(0, 312, 58, 268, 128, 292, 0.38)} fill={SF2} />
					<path d={peakSnow(128, 292, 218, 252, 308, 272, 0.44)} fill={SF2} />
					<path d={peakSnow(308, 272, 378, 248, 458, 268, 0.44)} fill={SF2} />
					<path d={peakSnow(458, 268, 538, 242, 618, 262, 0.44)} fill={SF2} />
					<path d={peakSnow(618, 262, 712, 250, 792, 270, 0.44)} fill={SF2} />
					<path d={peakSnow(792, 270, 862, 258, 900, 264, 0.46)} fill={SF2} />
				</g>

				{/* ── Ground ── */}
				<rect
					x='0'
					y='315'
					width='900'
					height='235'
					fill={`rgb(${gR},${gG},${gB})`}
					style={{ transition: 'fill 2s ease' }}
				/>

				{/* ── Snow ground cover ── */}
				<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
					<rect
						x='0'
						y='316'
						width='900'
						height='235'
						fill={`rgba(218,232,248,${snow * 0.88})`}
					/>
					<ellipse
						cx='450'
						cy='317'
						rx='490'
						ry='11'
						fill='rgba(238,246,255,0.72)'
					/>
					<rect x='0' y='316' width='900' height='100' fill='url(#snowGloss)' />
					<ellipse
						cx='340'
						cy='325'
						rx='280'
						ry='18'
						fill='url(#snowSpec)'
						filter='url(#snowBlur)'
					/>
					<ellipse
						cx='680'
						cy='329'
						rx='140'
						ry='10'
						fill='rgba(255,255,255,0.28)'
						filter='url(#snowBlur)'
					/>
					<rect
						x='0'
						y='395'
						width='900'
						height='156'
						fill='rgba(185,208,235,0.12)'
					/>
				</g>

				{/* ── Grass & dandelions — behind tent ── */}
				{TUFTS_BEHIND.map(([x, y, sc, min], i) => (
					<Tuft
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

				{/* ── Trees left ── */}
				<g>
					<rect
						x='93'
						y='308'
						width='10'
						height='14'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='98,232 128,290 68,290'
						fill={
							isDay
								? `rgba(28,${Math.round(lerp(72, 88, nat))},28,0.92)`
								: 'rgba(10,22,10,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='98,248 122,298 74,298'
						fill={
							isDay
								? `rgba(32,${Math.round(lerp(78, 95, nat))},30,0.95)`
								: 'rgba(12,26,12,0.95)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='98,265 126,310 70,310'
						fill={
							isDay
								? `rgba(35,${Math.round(lerp(82, 100, nat))},32,1)`
								: 'rgba(14,28,14,1)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(98, 232, 68, 128, 290, 0.46)} fill={SF} />
						<path d={tierSnow(98, 248, 74, 122, 298, 0.46)} fill={SF2} />
						<path d={tierSnow(98, 265, 70, 126, 310, 0.46)} fill={SF2} />
					</g>
					<rect
						x='44'
						y='308'
						width='8'
						height='12'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='48,258 72,300 24,300'
						fill={
							isDay
								? `rgba(25,${Math.round(lerp(65, 82, nat))},25,0.88)`
								: 'rgba(8,20,8,0.88)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='48,272 70,312 26,312'
						fill={
							isDay
								? `rgba(30,${Math.round(lerp(72, 90, nat))},28,0.92)`
								: 'rgba(10,24,10,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(48, 258, 24, 72, 300, 0.46)} fill={SF} />
						<path d={tierSnow(48, 272, 26, 70, 312, 0.46)} fill={SF2} />
					</g>
					<rect
						x='166'
						y='308'
						width='8'
						height='12'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='170,272 192,308 148,308'
						fill={
							isDay
								? `rgba(28,${Math.round(lerp(68, 85, nat))},26,0.88)`
								: 'rgba(9,22,9,0.88)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='170,285 190,316 150,316'
						fill={
							isDay
								? `rgba(32,${Math.round(lerp(76, 94, nat))},30,0.92)`
								: 'rgba(12,26,12,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(170, 272, 148, 192, 308, 0.46)} fill={SF} />
						<path d={tierSnow(170, 285, 150, 190, 316, 0.46)} fill={SF2} />
					</g>
				</g>

				{/* ── Trees right ── */}
				<g>
					<rect
						x='791'
						y='308'
						width='10'
						height='14'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='796,238 826,290 766,290'
						fill={
							isDay
								? `rgba(28,${Math.round(lerp(72, 88, nat))},28,0.92)`
								: 'rgba(10,22,10,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='796,254 820,298 772,298'
						fill={
							isDay
								? `rgba(32,${Math.round(lerp(78, 95, nat))},30,0.95)`
								: 'rgba(12,26,12,0.95)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='796,268 824,310 768,310'
						fill={
							isDay
								? `rgba(35,${Math.round(lerp(82, 100, nat))},32,1)`
								: 'rgba(14,28,14,1)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(796, 238, 766, 826, 290, 0.46)} fill={SF} />
						<path d={tierSnow(796, 254, 772, 820, 298, 0.46)} fill={SF2} />
						<path d={tierSnow(796, 268, 768, 824, 310, 0.46)} fill={SF2} />
					</g>
					<rect
						x='854'
						y='308'
						width='8'
						height='12'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='858,260 882,300 834,300'
						fill={
							isDay
								? `rgba(25,${Math.round(lerp(65, 82, nat))},25,0.88)`
								: 'rgba(8,20,8,0.88)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='858,274 880,312 836,312'
						fill={
							isDay
								? `rgba(30,${Math.round(lerp(72, 90, nat))},28,0.92)`
								: 'rgba(10,24,10,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(858, 260, 834, 882, 300, 0.46)} fill={SF} />
						<path d={tierSnow(858, 274, 836, 880, 312, 0.46)} fill={SF2} />
					</g>
					<rect
						x='726'
						y='308'
						width='8'
						height='12'
						rx='2'
						fill={isDay ? '#4a3018' : '#221408'}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='730,274 752,308 708,308'
						fill={
							isDay
								? `rgba(28,${Math.round(lerp(68, 85, nat))},26,0.88)`
								: 'rgba(9,22,9,0.88)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<polygon
						points='730,287 750,316 710,316'
						fill={
							isDay
								? `rgba(32,${Math.round(lerp(76, 94, nat))},30,0.92)`
								: 'rgba(12,26,12,0.92)'
						}
						style={{ transition: 'fill 2s ease' }}
					/>
					<g style={{ transition: 'opacity 2.2s ease' }} opacity={snow}>
						<path d={tierSnow(730, 274, 708, 752, 308, 0.46)} fill={SF} />
						<path d={tierSnow(730, 287, 710, 750, 316, 0.46)} fill={SF2} />
					</g>
				</g>

				{/* ── Tent + Fire + Smoke — shifted right 140px ── */}
				<g transform='translate(140,0)'>
					{/* Tent */}
					<g>
						<path
							d='M 270,382 L 392,278 L 392,382 Z'
							fill='url(#tentL)'
							style={{ transition: 'fill 2s ease' }}
						/>
						<path
							d='M 392,278 L 514,382 L 392,382 Z'
							fill='url(#tentR)'
							style={{ transition: 'fill 2s ease' }}
						/>
						<path
							d='M 353,382 L 392,298 L 392,382 Z'
							fill={`rgba(${Math.round(lerp(195, 55, t * 0.82))},${Math.round(lerp(155, 38, t * 0.82))},${Math.round(lerp(42, 10, t * 0.82))},0.28)`}
							style={{ transition: 'fill 2s ease' }}
						/>
						<path
							d='M 392,298 L 431,382 L 392,382 Z'
							fill={`rgba(${Math.round(lerp(165, 42, t * 0.82))},${Math.round(lerp(118, 28, t * 0.82))},${Math.round(lerp(22, 6, t * 0.82))},0.22)`}
							style={{ transition: 'fill 2s ease' }}
						/>
						<path
							d='M 374,382 L 392,312 L 410,382 Z'
							fill={isDay ? 'rgba(38,28,8,0.88)' : 'rgba(8,6,2,0.96)'}
							style={{ transition: 'fill 2s ease' }}
						/>
						<path d='M 378,382 L 392,325 L 406,382 Z' fill='url(#tentI)' />
						<line
							x1='270'
							y1='382'
							x2='220'
							y2='400'
							stroke={isDay ? 'rgba(148,128,98,0.52)' : 'rgba(78,68,48,0.48)'}
							strokeWidth='1.5'
							style={{ transition: 'stroke 2s ease' }}
						/>
						<line
							x1='514'
							y1='382'
							x2='562'
							y2='400'
							stroke={isDay ? 'rgba(148,128,98,0.52)' : 'rgba(78,68,48,0.48)'}
							strokeWidth='1.5'
							style={{ transition: 'stroke 2s ease' }}
						/>
						<line
							x1='220'
							y1='400'
							x2='218'
							y2='413'
							stroke={isDay ? 'rgba(138,108,78,0.65)' : 'rgba(68,52,38,0.6)'}
							strokeWidth='2.2'
						/>
						<line
							x1='562'
							y1='400'
							x2='564'
							y2='413'
							stroke={isDay ? 'rgba(138,108,78,0.65)' : 'rgba(68,52,38,0.6)'}
							strokeWidth='2.2'
						/>
					</g>

					{/* Grass & dandelions — in front of tent */}
					{TUFTS_FRONT.map(([x, y, sc, min], i) => (
						<Tuft
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

					{/* Fire glow */}
					<ellipse
						cx={578}
						cy={405}
						rx={88 * fireGlow}
						ry={42 * fireGlow}
						fill='url(#fireG)'
						style={{ transition: 'rx 1.2s ease, ry 1.2s ease' }}
					/>

					{/* Fire logs */}
					<line
						x1='548'
						y1='418'
						x2='608'
						y2='410'
						stroke={isDay ? '#6b4828' : '#3a2010'}
						strokeWidth='7'
						strokeLinecap='round'
						style={{ transition: 'stroke 2s ease' }}
					/>
					<line
						x1='552'
						y1='422'
						x2='604'
						y2='410'
						stroke={isDay ? '#7a5a2e' : '#4a2a12'}
						strokeWidth='5'
						strokeLinecap='round'
						transform='rotate(28,578,416)'
						style={{ transition: 'stroke 2s ease' }}
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
						<path
							d='M 558,420 Q 562,402 578,390 Q 592,402 598,420 Z'
							fill={`rgba(255,${Math.round(lerp(42, 115, fireGlow))},0,${0.65 + fireGlow * 0.3})`}
						>
							<animate
								attributeName='d'
								values='M 558,420 Q 562,402 578,390 Q 592,402 598,420 Z;M 556,420 Q 565,399 578,386 Q 590,399 600,420 Z;M 558,420 Q 562,402 578,390 Q 592,402 598,420 Z'
								dur='0.78s'
								repeatCount='indefinite'
							/>
						</path>
						<path
							d='M 556,420 Q 554,408 559,397 Q 564,408 564,420 Z'
							fill={`rgba(255,${Math.round(lerp(95, 165, fireGlow))},18,${0.55 + fireGlow * 0.3})`}
						>
							<animate
								attributeName='d'
								values='M 556,420 Q 554,408 559,397 Q 564,408 564,420 Z;M 555,420 Q 557,405 562,393 Q 566,405 567,420 Z;M 556,420 Q 554,408 559,397 Q 564,408 564,420 Z'
								dur='1.05s'
								repeatCount='indefinite'
							/>
						</path>
						<path
							d='M 592,420 Q 594,407 598,396 Q 603,407 600,420 Z'
							fill={`rgba(255,${Math.round(lerp(72, 138, fireGlow))},8,${0.58 + fireGlow * 0.28})`}
						>
							<animate
								attributeName='d'
								values='M 592,420 Q 594,407 598,396 Q 603,407 600,420 Z;M 591,420 Q 596,404 599,392 Q 602,404 603,420 Z;M 592,420 Q 594,407 598,396 Q 603,407 600,420 Z'
								dur='0.92s'
								repeatCount='indefinite'
							/>
						</path>
						<path
							d='M 569,420 Q 571,406 578,395 Q 585,406 587,420 Z'
							fill={`rgba(255,255,${Math.round(lerp(42, 185, fireGlow))},${0.48 + fireGlow * 0.42})`}
						>
							<animate
								attributeName='d'
								values='M 569,420 Q 571,406 578,395 Q 585,406 587,420 Z;M 568,420 Q 574,403 578,391 Q 581,403 588,420 Z;M 569,420 Q 571,406 578,395 Q 585,406 587,420 Z'
								dur='0.65s'
								repeatCount='indefinite'
							/>
						</path>
					</g>

					{/* Smoke */}
					{[0, 1, 2].map((i) => (
						<circle
							key={i}
							cx={578 + (i - 1) * 4}
							cy={368}
							r={3 + i * 2.2}
							fill={`rgba(${Math.round(lerp(145, 72, t))},${Math.round(lerp(145, 72, t))},${Math.round(lerp(158, 82, t))},0.12)`}
							style={{ transition: 'fill 2s ease' }}
						>
							<animate
								attributeName='cy'
								values='368;338;305'
								dur={`${2.4 + i * 0.75}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='opacity'
								values='0.22;0.12;0'
								dur={`${2.4 + i * 0.75}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='r'
								values={`${3 + i * 2.2};${7 + i * 3};${13 + i * 4}`}
								dur={`${2.4 + i * 0.75}s`}
								repeatCount='indefinite'
							/>
						</circle>
					))}
				</g>
				{/* end translate(140,0) */}

				{/* ── Fireflies ── */}
				<g
					style={{ transition: 'opacity 2s ease' }}
					opacity={nat > 0.28 ? 1 : 0}
				>
					{FIREFLIES.map((ff, i) => (
						<circle
							key={i}
							cx={ff.x}
							cy={ff.y}
							r={2.8}
							fill={`rgba(${Math.round(lerp(172, 238, nat))},${Math.round(lerp(218, 255, nat))},${Math.round(lerp(72, 115, nat))},0.9)`}
							filter='url(#ffGlow)'
						>
							<animate
								attributeName='opacity'
								values={`0;${nat * 0.88};0`}
								dur={`${ff.dur}s`}
								begin={`${ff.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='cy'
								values={`${ff.y};${ff.y - 9};${ff.y}`}
								dur={`${parseFloat(ff.dur) * 1.6}s`}
								begin={`${ff.delay}s`}
								repeatCount='indefinite'
							/>
						</circle>
					))}
				</g>

				{/* ── Rain ── */}
				<g style={{ transition: 'opacity 2s ease' }} opacity={r}>
					{RAIN.map((drop, i) => (
						<line
							key={i}
							x1={drop.x}
							y1={-22}
							x2={drop.x + 3}
							y2={-9}
							stroke='rgba(148,192,228,0.52)'
							strokeWidth='1.1'
							strokeLinecap='round'
						>
							<animate
								attributeName='y1'
								values='-22;568'
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='y2'
								values='-9;581'
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='x1'
								values={`${drop.x};${drop.x + 9}`}
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
							<animate
								attributeName='x2'
								values={`${drop.x + 3};${drop.x + 12}`}
								dur={`${drop.dur}s`}
								begin={`${drop.delay}s`}
								repeatCount='indefinite'
							/>
						</line>
					))}
				</g>

				{/* ── Overlays ── */}
				<rect
					width='900'
					height='550'
					fill={`rgba(4,2,18,${nightOver})`}
					style={{ transition: 'fill 2s ease', pointerEvents: 'none' }}
				/>
				<rect
					width='900'
					height='550'
					fill={`rgba(255,138,28,${warmOver})`}
					style={{ transition: 'fill 1.8s ease', pointerEvents: 'none' }}
				/>
				<rect
					width='900'
					height='550'
					fill={`rgba(60,90,140,${r * 0.08})`}
					style={{ transition: 'fill 2s ease', pointerEvents: 'none' }}
				/>
			</g>
		</svg>
	);
}
