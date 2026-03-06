import { interpolateColor, lerpColor, lerpVal } from '@/lib/colors';

export default function Scene({
	energy,
	weather,
	warmth,
	time,
	nature
}: {
	energy: number;
	weather: number;
	warmth: number;
	time: number;
	nature: number;
}) {
	// Derived palette
	const nightness = time; // 0 sunrise, 1 midnight
	const coziness = warmth;
	const raininess = weather;
	const alertness = energy;
	const vibrance = nature;

	// Sky colors
	const skyTop = interpolateColor(
		nightness < 0.5
			? lerpColor('#f9d29d', '#2d1b69', nightness * 2)
			: lerpColor('#2d1b69', '#080c1a', (nightness - 0.5) * 2),
		lerpColor('#c97b3a', '#5c1a0a', coziness),
		0.18
	);
	const skyBot = interpolateColor(
		nightness < 0.5
			? lerpColor('#f7a35c', '#1a0e40', nightness * 2)
			: lerpColor('#1a0e40', '#050810', (nightness - 0.5) * 2),
		lerpColor('#e8904a', '#7a2e08', coziness),
		0.18
	);

	// Ground
	const groundColor = interpolateColor(
		lerpColor('#4a7c59', '#1e3d2a', nightness),
		lerpColor('#6b5a3a', '#3d2a18', coziness),
		0.3
	);

	// Tree colors
	const treeColor = lerpColor(
		lerpColor('#3a6644', '#162b1e', nightness),
		'#2d1f0e',
		coziness * 0.4
	);

	// Tent color
	const tentColor = interpolateColor(
		lerpColor('#e8c97a', '#d4a853', nightness * 0.5),
		lerpColor('#d4874a', '#8b4a1e', coziness),
		0.3
	);

	// Stars
	const starOpacity = nightness > 0.3 ? (nightness - 0.3) / 0.7 : 0;

	// Lamp glow
	const lampGlow = nightness;
	const lampColor = lerpColor('#ffcc44', '#ff8800', coziness);

	// Rain
	const rainDrops = Array.from({ length: 40 }, (_, i) => ({
		x: (i * 73 + 17) % 800,
		delay: ((i * 37) % 100) / 100,
		speed: 0.4 + (((i * 53) % 10) / 10) * 0.4,
		len: 8 + (i % 5) * 3
	}));

	// Steam
	const steamOpacity = coziness > 0.4 ? (coziness - 0.4) / 0.6 : 0;

	// Puddle
	const puddleRx = raininess > 0.5 ? (raininess - 0.5) * 2 * 28 : 0;

	// Person mood (alertness)
	const eyeOpen = alertness; // 0 = sleepy closed, 1 = wide open

	// Cat mood
	const catAlertness = alertness;

	// Firefly opacity
	const fireflyOpacity = lerpVal(0.1, 0.8, vibrance);

	return (
		<svg
			viewBox='0 0 900 560'
			style={{ width: '100%', height: '100%', display: 'block' }}
			preserveAspectRatio='xMidYMid slice'
		>
			<defs>
				<radialGradient id='lampGlow' cx='50%' cy='50%' r='50%'>
					<stop
						offset='0%'
						stopColor={lampColor}
						stopOpacity={0.9 * lampGlow}
					/>
					<stop offset='100%' stopColor={lampColor} stopOpacity={0} />
				</radialGradient>
				<radialGradient id='skyGrad' cx='50%' cy='0%' r='100%'>
					<stop offset='0%' stopColor={skyTop} />
					<stop offset='100%' stopColor={skyBot} />
				</radialGradient>
				<filter id='softBlur'>
					<feGaussianBlur stdDeviation='2' />
				</filter>
				<filter id='glow'>
					<feGaussianBlur stdDeviation='8' result='blur' />
					<feMerge>
						<feMergeNode in='blur' />
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
				<filter id='grain'>
					<feTurbulence
						type='fractalNoise'
						baseFrequency='0.65'
						numOctaves='3'
						stitchTiles='stitch'
					/>
					<feColorMatrix type='saturate' values='0' />
					<feBlend in='SourceGraphic' mode='multiply' />
				</filter>
				<clipPath id='sceneClip'>
					<rect width='900' height='560' />
				</clipPath>
			</defs>

			{/* Sky */}
			<rect width='900' height='560' fill='url(#skyGrad)' />

			{/* Stars */}
			{[...Array(30)].map((_, i) => {
				const sx = ((i * 97 + 31) % 860) + 20;
				const sy = ((i * 61 + 13) % 200) + 10;
				const ss = 0.8 + (i % 5) * 0.4;
				return (
					<circle
						key={i}
						cx={sx}
						cy={sy}
						r={ss}
						fill='white'
						opacity={starOpacity * (0.5 + (i % 3) * 0.25)}
					/>
				);
			})}

			{/* Moon */}
			<g opacity={nightness}>
				<circle cx='760' cy='60' r='32' fill='#f5e6b0' />
				<circle cx='775' cy='52' r='28' fill={skyTop} />
			</g>

			{/* Sun / sunrise glow */}
			<circle
				cx='100'
				cy='90'
				r={30}
				fill='#ffdd88'
				opacity={Math.max(0, 1 - nightness * 2.5)}
				filter='url(#softBlur)'
			/>

			{/* Far trees (silhouette) */}
			<g fill={treeColor} opacity={0.7}>
				{[60, 130, 190, 250, 660, 720, 790, 840].map((tx, i) => (
					<ellipse
						key={i}
						cx={tx}
						cy={310 - (i % 3) * 18}
						rx={28 + (i % 2) * 12}
						ry={55 + (i % 3) * 20}
					/>
				))}
			</g>

			{/* Ground */}
			<ellipse cx='450' cy='490' rx='520' ry='130' fill={groundColor} />
			<rect x='0' y='460' width='900' height='100' fill={groundColor} />

			{/* Grass tufts - more when vibrant */}
			{vibrance > 0.2 &&
				[...Array(14)].map((_, i) => {
					const gx = 50 + i * 60 + (i % 3) * 10;
					const gy = 455;
					const gh = 6 + (i % 4) * 4;
					const gopacity = 0.3 + vibrance * 0.5;
					return (
						<g key={i} opacity={gopacity}>
							<line
								x1={gx}
								y1={gy}
								x2={gx - 4}
								y2={gy - gh}
								stroke='#4a8a3a'
								strokeWidth='1.5'
								strokeLinecap='round'
							/>
							<line
								x1={gx}
								y1={gy}
								x2={gx}
								y2={gy - gh - 2}
								stroke='#5a9a4a'
								strokeWidth='1.5'
								strokeLinecap='round'
							/>
							<line
								x1={gx}
								y1={gy}
								x2={gx + 4}
								y2={gy - gh}
								stroke='#4a8a3a'
								strokeWidth='1.5'
								strokeLinecap='round'
							/>
						</g>
					);
				})}

			{/* Big trees left */}
			<g>
				{/* Trunk left */}
				<rect
					x='148'
					y='280'
					width='18'
					height='160'
					rx='6'
					fill={lerpColor('#5c3d1a', '#2a1a08', nightness)}
				/>
				{/* Canopy left */}
				<ellipse cx='157' cy='260' rx='65' ry='80' fill={treeColor} />
				<ellipse
					cx='120'
					cy='290'
					rx='50'
					ry='65'
					fill={treeColor}
					opacity={0.85}
				/>
				<ellipse
					cx='190'
					cy='295'
					rx='45'
					ry='60'
					fill={lerpColor('#2d5e3a', '#0e2416', nightness)}
					opacity={0.9}
				/>
			</g>

			{/* Big tree right (branch going right-bottom) */}
			<g>
				<path
					d={`M 820 0 Q 850 120 800 240`}
					stroke={lerpColor('#5c3d1a', '#2a1a08', nightness)}
					strokeWidth='22'
					fill='none'
					strokeLinecap='round'
				/>
				<path
					d={`M 820 60 Q 870 100 860 200`}
					stroke={lerpColor('#5c3d1a', '#2a1a08', nightness)}
					strokeWidth='14'
					fill='none'
					strokeLinecap='round'
				/>
				<ellipse
					cx='830'
					cy='30'
					rx='55'
					ry='50'
					fill={treeColor}
					opacity={0.9}
				/>
				<ellipse
					cx='870'
					cy='60'
					rx='40'
					ry='45'
					fill={lerpColor('#2d5e3a', '#0e2416', nightness)}
					opacity={0.85}
				/>
			</g>

			{/* Hanging branch from right tree */}
			<path
				d='M 780 180 Q 700 230 620 250'
				stroke={lerpColor('#5c3d1a', '#2a1a08', nightness)}
				strokeWidth='10'
				fill='none'
				strokeLinecap='round'
			/>

			{/* ─ Small table ─ */}
			<g>
				{/* Tabletop */}
				<ellipse
					cx='490'
					cy='388'
					rx='52'
					ry='14'
					fill={lerpColor(
						'#c4976a',
						'#6b4a22',
						nightness * 0.7 + coziness * 0.3
					)}
				/>
				{/* Legs */}
				<line
					x1='454'
					y1='395'
					x2='446'
					y2='440'
					stroke={lerpColor('#a07848', '#5a3810', nightness)}
					strokeWidth='5'
					strokeLinecap='round'
				/>
				<line
					x1='526'
					y1='395'
					x2='534'
					y2='440'
					stroke={lerpColor('#a07848', '#5a3810', nightness)}
					strokeWidth='5'
					strokeLinecap='round'
				/>
				<line
					x1='468'
					y1='400'
					x2='468'
					y2='442'
					stroke={lerpColor('#a07848', '#5a3810', nightness)}
					strokeWidth='4'
					strokeLinecap='round'
				/>
				<line
					x1='512'
					y1='400'
					x2='512'
					y2='442'
					stroke={lerpColor('#a07848', '#5a3810', nightness)}
					strokeWidth='4'
					strokeLinecap='round'
				/>
			</g>

			{/* Lamp on table */}
			<g>
				{/* Lamp glow halo */}
				<circle cx='490' cy='360' r='60' fill='url(#lampGlow)' />
				{/* Lamp base */}
				<rect
					x='483'
					y='362'
					width='14'
					height='22'
					rx='3'
					fill={lerpColor('#c4976a', '#6b4a22', nightness)}
				/>
				{/* Lamp shade */}
				<path
					d='M 472 362 L 478 340 L 502 340 L 508 362 Z'
					fill={lerpColor('#e8c060', '#c47820', coziness)}
					opacity={0.95}
				/>
				{/* Shade outline */}
				<path
					d='M 472 362 L 478 340 L 502 340 L 508 362 Z'
					fill='none'
					stroke={lerpColor('#b89040', '#8b5010', nightness)}
					strokeWidth='1.5'
				/>
				{/* Lamp light dot */}
				<circle
					cx='490'
					cy='350'
					r='3'
					fill={lerpColor('#ffee88', '#ff9900', coziness)}
					opacity={0.8 + lampGlow * 0.2}
				/>
			</g>

			{/* Puddle */}
			{puddleRx > 0 && (
				<ellipse
					cx='390'
					cy='465'
					rx={puddleRx}
					ry={puddleRx * 0.35}
					fill={lerpColor('#3a6680', '#1a3040', nightness)}
					opacity={raininess * 0.65}
				/>
			)}

			{/* ─ Tent ─ */}
			<g>
				{/* Main tent body */}
				<path
					d='M 320 445 L 430 310 L 540 445 Z'
					fill={tentColor}
					opacity={0.92}
				/>
				{/* Tent shadow side */}
				<path
					d='M 430 310 L 540 445 L 460 445 Z'
					fill={lerpColor(
						'#b8903a',
						'#6b3e12',
						coziness * 0.5 + nightness * 0.5
					)}
					opacity={0.5}
				/>
				{/* Tent door outline */}
				<path
					d='M 396 445 Q 415 395 430 445 Z'
					fill={lerpColor('#1a1208', '#0a0805', nightness)}
					opacity={0.7}
				/>
				{/* Tent outline */}
				<path
					d='M 320 445 L 430 310 L 540 445'
					fill='none'
					stroke={lerpColor('#8b6a2a', '#4a2a08', nightness)}
					strokeWidth='2'
					strokeLinejoin='round'
				/>
				{/* Tent stakes/ropes */}
				<line
					x1='430'
					y1='310'
					x2='410'
					y2='290'
					stroke={lerpColor('#8b6a2a', '#4a2a08', nightness)}
					strokeWidth='1.5'
					strokeDasharray='3,3'
					opacity={0.6}
				/>
				<line
					x1='430'
					y1='310'
					x2='450'
					y2='290'
					stroke={lerpColor('#8b6a2a', '#4a2a08', nightness)}
					strokeWidth='1.5'
					strokeDasharray='3,3'
					opacity={0.6}
				/>

				{/* Rain draping on tent */}
				{raininess > 0.2 &&
					[...Array(8)].map((_, i) => {
						const rx = 330 + i * 28;
						const topY = 310 + ((rx - 320) * (445 - 310)) / (540 - 320) - 2;
						return (
							<line
								key={i}
								x1={rx}
								y1={topY}
								x2={rx - 3}
								y2={topY + 22}
								stroke='#aaddff'
								strokeWidth='1'
								opacity={raininess * 0.7}
							/>
						);
					})}
			</g>

			{/* ─ Person (meditating) ─ */}
			<g>
				{/* Body */}
				<ellipse
					cx='640'
					cy='440'
					rx='38'
					ry='20'
					fill={lerpColor('#e8c09a', '#c48a5a', coziness)}
				/>
				{/* Legs crossed */}
				<path
					d='M 610 445 Q 620 460 640 455 Q 660 460 670 445'
					fill={lerpColor('#d4a87a', '#a06030', coziness)}
					opacity={0.9}
				/>
				{/* Torso */}
				<path
					d='M 625 440 Q 630 405 640 400 Q 650 405 655 440'
					fill={lerpColor('#e8c09a', '#c48a5a', coziness)}
				/>
				{/* Head */}
				<circle
					cx='640'
					cy='388'
					r='28'
					fill={lerpColor('#e8c09a', '#c48a5a', coziness)}
				/>
				{/* Hair */}
				<path
					d='M 616 382 Q 620 360 640 358 Q 660 360 664 382'
					fill={lerpColor('#4a2a10', '#1a0a04', nightness * 0.5 + 0.5)}
				/>
				{/* Eyes - sleepy vs alert */}
				<g opacity={0.85}>
					{eyeOpen < 0.5 ? (
						<>
							{/* Sleepy eyes - curved lines */}
							<path
								d={`M 628 387 Q 632 ${385 + (1 - eyeOpen) * 4} 636 387`}
								stroke='#3a2010'
								strokeWidth='1.8'
								fill='none'
								strokeLinecap='round'
							/>
							<path
								d={`M 644 387 Q 648 ${385 + (1 - eyeOpen) * 4} 652 387`}
								stroke='#3a2010'
								strokeWidth='1.8'
								fill='none'
								strokeLinecap='round'
							/>
						</>
					) : (
						<>
							{/* Alert eyes - open circles */}
							<circle cx='632' cy='386' r={2 + eyeOpen * 2.5} fill='#3a2010' />
							<circle cx='648' cy='386' r={2 + eyeOpen * 2.5} fill='#3a2010' />
							<circle cx='633' cy='385' r='1' fill='white' opacity={eyeOpen} />
							<circle cx='649' cy='385' r='1' fill='white' opacity={eyeOpen} />
						</>
					)}
				</g>
				{/* Smile - wider when cozy/alert */}
				<path
					d={`M 633 396 Q 640 ${398 + coziness * 5} 647 396`}
					stroke='#8a4a20'
					strokeWidth='1.8'
					fill='none'
					strokeLinecap='round'
				/>
				{/* Arm holding mug */}
				<path
					d='M 655 430 Q 680 430 688 420'
					stroke={lerpColor('#e8c09a', '#c48a5a', coziness)}
					strokeWidth='10'
					fill='none'
					strokeLinecap='round'
				/>
				{/* Mug */}
				<g>
					<rect
						x='682'
						y='410'
						width='22'
						height='20'
						rx='4'
						fill={lerpColor('#d4a060', '#8b5020', coziness)}
					/>
					<path
						d='M 704 414 Q 712 417 704 424'
						stroke={lerpColor('#c49050', '#7a4010', coziness)}
						strokeWidth='2.5'
						fill='none'
					/>
				</g>
				{/* Steam from mug */}
				<g opacity={steamOpacity}>
					<path
						d='M 688 408 Q 692 398 688 390'
						stroke='#ddeeff'
						strokeWidth='2'
						fill='none'
						strokeLinecap='round'
						opacity={0.6}
					/>
					<path
						d='M 694 406 Q 698 394 694 386'
						stroke='#ddeeff'
						strokeWidth='2'
						fill='none'
						strokeLinecap='round'
						opacity={0.5}
					/>
					<path
						d='M 700 408 Q 704 396 700 388'
						stroke='#ddeeff'
						strokeWidth='2'
						fill='none'
						strokeLinecap='round'
						opacity={0.4}
					/>
				</g>
			</g>

			{/* ─ Cat ─ */}
			<g>
				{/* Cat body */}
				<ellipse
					cx='560'
					cy='475'
					rx={catAlertness > 0.5 ? 22 : 28}
					ry={catAlertness > 0.5 ? 16 : 14}
					fill={lerpColor('#8a7055', '#4a3825', nightness * 0.5 + 0.3)}
				/>
				{/* Cat head */}
				<circle
					cx={catAlertness > 0.5 ? '548' : '540'}
					cy={catAlertness > 0.5 ? '462' : '468'}
					r='14'
					fill={lerpColor('#8a7055', '#4a3825', nightness * 0.5 + 0.3)}
				/>
				{/* Cat ears */}
				<polygon
					points={
						catAlertness > 0.5
							? '537,462 541,448 545,462'
							: '530,464 534,452 538,464'
					}
					fill={lerpColor('#7a6045', '#3a2815', nightness * 0.5 + 0.3)}
				/>
				<polygon
					points={
						catAlertness > 0.5
							? '550,462 554,448 558,462'
							: '543,464 547,452 551,464'
					}
					fill={lerpColor('#7a6045', '#3a2815', nightness * 0.5 + 0.3)}
				/>
				{/* Cat eyes */}
				{catAlertness < 0.5 ? (
					<>
						<path
							d={`M ${catAlertness > 0.5 ? 541 : 533} 468 Q ${catAlertness > 0.5 ? 545 : 537} 466 ${catAlertness > 0.5 ? 549 : 541} 468`}
							stroke='#2a1a0a'
							strokeWidth='1.5'
							fill='none'
						/>
						<path
							d={`M ${catAlertness > 0.5 ? 551 : 543} 468 Q ${catAlertness > 0.5 ? 555 : 547} 466 ${catAlertness > 0.5 ? 559 : 551} 468`}
							stroke='#2a1a0a'
							strokeWidth='1.5'
							fill='none'
						/>
					</>
				) : (
					<>
						<ellipse cx='540' cy='462' rx='3.5' ry='4' fill='#1a0a00' />
						<ellipse cx='554' cy='462' rx='3.5' ry='4' fill='#1a0a00' />
						<circle cx='541' cy='461' r='1' fill='white' opacity={0.7} />
						<circle cx='555' cy='461' r='1' fill='white' opacity={0.7} />
					</>
				)}
				{/* Tail */}
				<path
					d={
						catAlertness > 0.6
							? 'M 582 468 Q 600 440 590 425'
							: 'M 582 475 Q 605 480 600 470'
					}
					stroke={lerpColor('#8a7055', '#4a3825', nightness * 0.5 + 0.3)}
					strokeWidth='6'
					fill='none'
					strokeLinecap='round'
				/>
			</g>

			{/* Fireflies */}
			{[...Array(6)].map((_, i) => {
				const fx = 200 + ((i * 137) % 400);
				const fy = 280 + ((i * 73) % 120);
				return (
					<circle
						key={i}
						cx={fx}
						cy={fy}
						r='2.5'
						fill='#ccff66'
						opacity={fireflyOpacity * (0.4 + (i % 3) * 0.3)}
						filter='url(#softBlur)'
					/>
				);
			})}

			{/* Bird */}
			<g opacity={lerpVal(0.0, 0.9, vibrance)}>
				<path
					d='M 570 155 Q 578 148 585 155'
					stroke={lerpColor('#3a2a18', '#0a0804', nightness)}
					strokeWidth='2'
					fill='none'
				/>
				<path
					d='M 585 155 Q 592 148 600 155'
					stroke={lerpColor('#3a2a18', '#0a0804', nightness)}
					strokeWidth='2'
					fill='none'
				/>
			</g>

			{/* Rain drops */}
			<g clipPath='url(#sceneClip)'>
				{rainDrops.map((drop, i) => (
					<line
						key={i}
						x1={drop.x}
						y1={-drop.len}
						x2={drop.x - 4}
						y2={0}
						stroke='#aaccee'
						strokeWidth='1.2'
						opacity={weather * 0.6}
						style={{
							animation: `rain-fall ${drop.speed + 0.5}s linear infinite`,
							animationDelay: `${drop.delay}s`
						}}
					/>
				))}
			</g>

			{/* Grain overlay */}
			<rect
				width='900'
				height='560'
				fill='transparent'
				filter='url(#grain)'
				opacity={0.04}
			/>

			<style>{`
        @keyframes rain-fall {
          0%   { transform: translateY(0); }
          100% { transform: translateY(600px); }
        }
        @keyframes steam-rise {
          0%   { transform: translateY(0) scaleX(1); opacity: 0.7; }
          50%  { transform: translateY(-10px) scaleX(1.3); opacity: 0.4; }
          100% { transform: translateY(-20px) scaleX(0.8); opacity: 0; }
        }
        @keyframes firefly-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.9; }
        }
      `}</style>
		</svg>
	);
}
