'use client';

import { useCallback, useState } from 'react';

import type { MoodVals, Preset } from '../../lib/constants';
import { PRESETS, SLIDERS } from '../../lib/constants';
import { animateMoodVals } from '@/lib/utils';
import styles from './ControlPanel.module.css';
import MoodSlider from './MoodSlider/MoodSlider';
import NowPlayingBar from './NowPlayingBar/NowPlayingBar';
import SavePresetBtn from './SavePresetBtn/SavePresetBtn';

interface ControlPanelProps {
	vals: MoodVals;
	animRef: { current: { cancel: () => void } | null };
	valsRef: { current: MoodVals };
	setVals: React.Dispatch<React.SetStateAction<MoodVals>>;
}

export default function ControlPanel({
	vals,
	animRef,
	valsRef,
	setVals
}: ControlPanelProps) {
	const [activePreset, setActive] = useState<string | null>('campfire');
	const [label, setLabel] = useState('');

	const animateTo = useCallback(
		(target: MoodVals, onDone?: () => void) => {
			animRef.current?.cancel();
			animRef.current = animateMoodVals({
				from: valsRef.current,
				to: target,
				duration: 1600,
				onUpdate: setVals,
				onDone: () => {
					animRef.current = null;
					onDone?.();
				}
			});
		},
		[animRef, valsRef, setVals]
	);

	const applyPreset = useCallback(
		(preset: Preset) => {
			setActive(preset.id);
			animateTo({
				time: preset.time,
				warmth: preset.warmth,
				weather: preset.weather,
				nature: preset.nature
			});
		},
		[animateTo]
	);

	const handleSlider = (key: keyof MoodVals, v: number) => {
		setActive(null);
		animRef.current?.cancel();
		animRef.current = null;
		setVals((prev) => ({ ...prev, [key]: v }));
	};

	return (
		<>
			{/* Bottle this vibe notification */}
			{/* <div
				className={styles.notice}
				style={{
					opacity: notice ? 1 : 0,
					transform: `translateX(-50%) translateY(${notice ? 0 : -12}px)`
				}}
			>
				{notice}
			</div> */}
			<div className={styles.panel}>
				<div className={styles.sectionLabel}>Presets</div>
				<div className={styles.presetRow}>
					{PRESETS.map((p) => (
						<button
							key={p.id}
							className={`${styles.chip}${activePreset === p.id ? ` ${styles.active}` : ''}`}
							onClick={() => applyPreset(p)}
						>
							{p.emoji} {p.name}
						</button>
					))}
				</div>
				<div className={styles.divider} />
				<div className={styles.sliders}>
					{SLIDERS.map((s) => (
						<MoodSlider
							key={s.key}
							config={s}
							value={vals[s.key]}
							onChange={(v) => handleSlider(s.key, v)}
						/>
					))}
				</div>
				<div className={styles.divider} />
				<SavePresetBtn
					label={label}
					setLabel={setLabel}
					setActive={setActive}
					animateTo={animateTo}
					valsRef={valsRef}
				/>
				<div className={styles.divider} />
				<NowPlayingBar vals={vals} />
			</div>
		</>
	);
}
