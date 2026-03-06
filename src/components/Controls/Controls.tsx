'use client';

import { useState, useCallback } from 'react';
import Slider from '@/components/Controls/Slider';
import NowPlaying from '@/components/Controls/NowPlaying';
import { PRESETS } from '@/lib/presets';
import type { MoodValues, MoodKey, Preset } from '@/types';

interface ControlsProps {
	values: MoodValues;
	setValues: React.Dispatch<React.SetStateAction<MoodValues>>;
	savedVibes: Preset[];
	setShowSave: (show: boolean) => void;
	targetRef: React.RefObject<MoodValues>;
}

export default function Controls({
	values,
	setValues,
	savedVibes,
	setShowSave,
	targetRef
}: ControlsProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [activePreset, setActivePreset] = useState<string | null>(null);

	const applyPreset = useCallback((preset: Preset) => {
		targetRef.current = { ...preset.values };
		setValues({ ...preset.values });
		setActivePreset(preset.name);
	}, []);

	const set = useCallback((key: MoodKey, value: number) => {
		targetRef.current = { ...targetRef.current, [key]: value };
		setValues((prev) => ({ ...prev, [key]: value }));
		setActivePreset(null);
	}, []);

	return (
		<div
			style={{
				position: 'absolute',
				bottom: '28px',
				left: '28px',
				width: 'clamp(260px, 30vw, 340px)',
				background: 'rgba(12,9,26,0.78)',
				backdropFilter: 'blur(16px)',
				WebkitBackdropFilter: 'blur(16px)',
				border: '1px solid rgba(255,210,100,0.14)',
				borderRadius: '18px',
				padding: '18px 20px 16px',
				display: 'flex',
				flexDirection: 'column',
				gap: '11px',
				boxShadow:
					'0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
				animation: 'fade-in-up 1s ease 0.2s both'
			}}
		>
			{/* Presets row */}
			<div>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '11px',
						color: 'rgba(255,235,190,0.4)',
						letterSpacing: '1px',
						textTransform: 'uppercase',
						marginBottom: '7px'
					}}
				>
					presets
				</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
					{PRESETS.map((p) => (
						<button
							key={p.name}
							onClick={() => applyPreset(p)}
							style={{
								padding: '4px 10px',
								borderRadius: '20px',
								background:
									activePreset === p.name
										? 'rgba(255,200,80,0.2)'
										: 'rgba(255,255,255,0.05)',
								border: `1px solid ${activePreset === p.name ? 'rgba(255,200,80,0.5)' : 'rgba(255,255,255,0.1)'}`,
								fontFamily: "'Caveat', cursive",
								fontSize: '12px',
								color:
									activePreset === p.name
										? '#ffd060'
										: 'rgba(255,235,190,0.55)',
								cursor: 'pointer',
								transition: 'all 0.2s',
								whiteSpace: 'nowrap'
							}}
						>
							{p.emoji} {p.name}
						</button>
					))}
					{savedVibes.map((vibe) => (
						<button
							key={vibe.name}
							onClick={() => applyPreset(vibe)}
							style={{
								padding: '4px 10px',
								borderRadius: '20px',
								background:
									activePreset === vibe.name
										? 'rgba(100,200,150,0.15)'
										: 'rgba(255,255,255,0.04)',
								border: `1px solid ${activePreset === vibe.name ? 'rgba(100,200,150,0.4)' : 'rgba(255,255,255,0.08)'}`,
								fontFamily: "'Caveat', cursive",
								fontSize: '12px',
								color:
									activePreset === vibe.name
										? '#80ffb0'
										: 'rgba(200,255,220,0.45)',
								cursor: 'pointer',
								transition: 'all 0.2s',
								whiteSpace: 'nowrap'
							}}
						>
							🔖 {vibe.name}
						</button>
					))}
				</div>
			</div>

			{/* Divider */}
			<div style={{ height: '1px', background: 'rgba(255,235,180,0.08)' }} />

			{/* Sliders */}
			<Slider
				label='time'
				leftLabel='sunrise'
				rightLabel='midnight'
				value={values.time}
				onChange={(value) => set('time', value)}
				icon='🕯️'
			/>
			<Slider
				label='energy'
				leftLabel='sleepy'
				rightLabel='focused'
				value={values.energy}
				onChange={(value) => set('energy', value)}
				icon='⚡'
			/>
			<Slider
				label='warmth'
				leftLabel='cool'
				rightLabel='cozy'
				value={values.warmth}
				onChange={(value) => set('warmth', value)}
				icon='🔥'
			/>
			<Slider
				label='weather'
				leftLabel='clear'
				rightLabel='rainy'
				value={values.weather}
				onChange={(value) => set('weather', value)}
				icon='🌧️'
			/>
			<Slider
				label='nature'
				leftLabel='quiet'
				rightLabel='vibrant'
				value={values.nature}
				onChange={(value) => set('nature', value)}
				icon='🌿'
			/>

			{/* Divider */}
			<div style={{ height: '1px', background: 'rgba(255,235,180,0.08)' }} />

			{/* Save vibe button */}
			<button
				onClick={() => setShowSave(true)}
				style={{
					padding: '8px 14px',
					borderRadius: '10px',
					background: 'rgba(255,200,80,0.07)',
					border: '1px dashed rgba(255,200,80,0.3)',
					fontFamily: "'Caveat', cursive",
					fontSize: '13px',
					color: 'rgba(255,215,100,0.7)',
					cursor: 'pointer',
					transition: 'all 0.2s',
					textAlign: 'center',
					letterSpacing: '0.3px'
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = 'rgba(255,200,80,0.15)';
					e.currentTarget.style.color = '#ffd060';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = 'rgba(255,200,80,0.07)';
					e.currentTarget.style.color = 'rgba(255,215,100,0.7)';
				}}
			>
				🏕️ bottle this vibe
			</button>

			{/* Now Playing */}
			<NowPlaying
				isPlaying={isPlaying}
				onToggle={() => setIsPlaying((p) => !p)}
			/>
		</div>
	);
}
