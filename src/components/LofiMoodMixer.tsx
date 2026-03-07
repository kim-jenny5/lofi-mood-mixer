'use client';

import {
	useState,
	useEffect,
	useRef,
	useCallback,
	useLayoutEffect
} from 'react';

import { lerp } from './utils';
import { engine } from './AudioEngine';
import { INIT, PRESETS, SLIDERS } from './constants';
import type { MoodVals, Preset, SavedVibe } from './constants';
import CampingScene from './CampingScene';
import MoodSlider from './MoodSlider';
import styles from './LofiMoodMixer.module.scss';

export default function LofiMoodMixer() {
	const [vals, setVals] = useState<MoodVals>(INIT);
	const [playing, setPlaying] = useState(false);
	const [activePreset, setActive] = useState<string | null>('campfire');
	const [savedVibes, setSaved] = useState<SavedVibe[]>([]);
	const [showInput, setShowInput] = useState(false);
	const [label, setLabel] = useState('');
	const [notice, setNotice] = useState('');
	const valsRef = useRef(vals);
	const animRef = useRef<number | null>(null);

	useEffect(() => {
		valsRef.current = vals;
	}, [vals]);

	// Font injection
	useLayoutEffect(() => {
		if (document.getElementById('lofi-fonts')) return;
		const link = document.createElement('link');
		link.id = 'lofi-fonts';
		link.rel = 'stylesheet';
		link.href =
			'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500;600&display=swap';
		document.head.appendChild(link);
	}, []);

	// ── Animation helper ──────────────────────────────────────────────────────────

	const animateTo = useCallback((target: MoodVals, onDone?: () => void) => {
		if (animRef.current) cancelAnimationFrame(animRef.current);
		const start = { ...valsRef.current };
		const t0 = performance.now();
		const dur = 1600;
		const step = (now: number) => {
			const p = Math.min((now - t0) / dur, 1);
			const ease = 1 - Math.pow(1 - p, 3);
			setVals({
				time: Math.round(lerp(start.time, target.time, ease)),
				warmth: Math.round(lerp(start.warmth, target.warmth, ease)),
				weather: Math.round(lerp(start.weather, target.weather, ease)),
				nature: Math.round(lerp(start.nature, target.nature, ease))
			});
			if (p < 1) animRef.current = requestAnimationFrame(step);
			else onDone?.();
		};
		animRef.current = requestAnimationFrame(step);
	}, []);

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

	const applyVibe = useCallback(
		(vibe: SavedVibe) => {
			setActive(null);
			animateTo(vibe.values);
		},
		[animateTo]
	);

	// ── Audio sync ────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (playing) {
			engine.setRain(vals.weather / 100);
			engine.setNature(vals.nature / 100);
		}
	}, [vals.weather, vals.nature, playing]);

	const togglePlay = () => {
		if (!playing) {
			engine.init();
			engine.play();
		} else engine.pause();
		setPlaying((p) => !p);
	};

	// ── Slider change ─────────────────────────────────────────────────────────────

	const handleChange = (key: keyof MoodVals, v: number) => {
		setActive(null);
		if (animRef.current) {
			cancelAnimationFrame(animRef.current);
			animRef.current = null;
		}
		setVals((prev) => ({ ...prev, [key]: v }));
	};

	// ── Save vibe ─────────────────────────────────────────────────────────────────

	const handleSave = () => {
		const name = label.trim();
		if (!name) return;
		setSaved((prev) => [
			...prev.slice(-4),
			{ id: Date.now(), name, values: { ...valsRef.current } }
		]);
		setLabel('');
		setShowInput(false);
		setNotice('Vibe bottled ✦');
		setTimeout(() => setNotice(''), 2200);
	};

	// ── Render ────────────────────────────────────────────────────────────────────

	return (
		<div className={styles.app}>
			{/* Scene */}
			<CampingScene {...vals} />

			{/* Header */}
			<header className={styles.header}>
				<h1 className={styles.title}>Lofi Mood Mixer</h1>
				<p className={styles.tagline}>Dial in your dream. Let the rest fade.</p>
			</header>

			{/* Notification */}
			<div
				className={styles.notice}
				style={{
					opacity: notice ? 1 : 0,
					transform: `translateX(-50%) translateY(${notice ? 0 : -12}px)`
				}}
			>
				{notice}
			</div>

			{/* Controls panel */}
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
							onChange={(v) => handleChange(s.key, v)}
						/>
					))}
				</div>

				<div className={styles.divider} />

				{/* Save / Bottle this vibe */}
				<div className={styles.saveSection}>
					<div className={styles.saveRow}>
						{showInput ? (
							<>
								<input
									className={styles.saveInput}
									placeholder='Name this vibe…'
									value={label}
									onChange={(e) => setLabel(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSave();
										if (e.key === 'Escape') {
											setShowInput(false);
											setLabel('');
										}
									}}
									autoFocus
								/>
								<button
									className={styles.saveBtn}
									onClick={handleSave}
									disabled={!label.trim()}
								>
									Save
								</button>
								<button
									className={styles.saveBtn}
									onClick={() => {
										setShowInput(false);
										setLabel('');
									}}
								>
									✕
								</button>
							</>
						) : (
							<button
								className={`${styles.saveBtn} ${styles.saveBtnFull}`}
								onClick={() => setShowInput(true)}
							>
								✦ Bottle this vibe
							</button>
						)}
					</div>
					{savedVibes.length > 0 && (
						<div className={styles.savedVibes}>
							{savedVibes.map((v) => (
								<button
									key={v.id}
									className={styles.vibeChip}
									onClick={() => applyVibe(v)}
								>
									{v.name}
								</button>
							))}
						</div>
					)}
				</div>

				<div className={styles.divider} />

				{/* Play row + badges + now playing */}
				<div className={styles.panelFooter}>
					<div className={styles.panelPlayRow}>
						<button
							className={`${styles.playBtn}${playing ? ` ${styles.playBtnOn}` : ''}`}
							onClick={togglePlay}
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
		</div>
	);
}
