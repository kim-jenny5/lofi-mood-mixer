'use client';

import { useState, useCallback } from 'react';

import { animateMoodVals } from '../utils';
import { PRESETS, SLIDERS } from '../constants';
import type { MoodVals, Preset } from '../constants';
import MoodSlider from './MoodSlider';
import styles from './ControlPanel.module.css';
import SavePreset from './SavePreset';

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
	const [playing, setPlaying] = useState(false);
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
				{/* Presets */}
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

				{/* Sliders */}
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
				<SavePreset
					label={label}
					setLabel={setLabel}
					setActive={setActive}
					animateTo={animateTo}
					valsRef={valsRef}
				/>
				<div className={styles.divider} />

				{/* Play row + badges + now playing */}
				<div className={styles.panelFooter}>
					<div className={styles.panelPlayRow}>
						<button
							className={`${styles.playBtn}${playing ? ` ${styles.playBtnOn}` : ''}`}
							title={playing ? 'Pause' : 'Play ambience'}
						>
							{playing ? '⏸' : '▶'}
						</button>
						<div className={styles.soundBadges}>
							<div
								className={`${styles.badge}${vals.weather > 15 ? ` ${styles.badgeActive}` : ''}`}
							>
								{vals.weather > 15 ? `🌧 Rain ${vals.weather}%` : '☀ Clear'}
							</div>
							<div
								className={`${styles.badge}${vals.nature > 18 ? ` ${styles.badgeActive}` : ''}`}
							>
								{vals.nature > 18 ? `🍃 Nature ${vals.nature}%` : '🔇 Quiet'}
							</div>
							{playing && (
								<div className={`${styles.badge} ${styles.badgeActive}`}>
									♪ Lofi stream
								</div>
							)}
						</div>
					</div>
					<div
						className={`${styles.nowPlaying}${playing ? ` ${styles.nowPlayingActive}` : ''}`}
					>
						{playing ? '♩ Now playing' : 'Now playing'}
					</div>
				</div>
			</div>
		</>
	);
}
