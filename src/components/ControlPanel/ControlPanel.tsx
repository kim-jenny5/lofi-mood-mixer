'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
	PanelLeftOpen,
	PanelLeftClose,
	PanelTopOpen,
	PanelTopClose
} from 'lucide-react';
import type { MoodVals, Preset, SavedVibe } from '../../lib/constants';
import { PRESETS, SLIDERS } from '../../lib/constants';
import { animateMoodVals } from '@/lib/utils';
import styles from './ControlPanel.module.css';
import MoodSlider from './MoodSlider/MoodSlider';
import NowPlayingBar from './NowPlayingBar/NowPlayingBar';
import SavePresetBtn from './SavePresetBtn/SavePresetBtn';
import PresetDrawer from './PresetDrawer/PresetDrawer';

const STORAGE_KEY = 'lofi-saved-vibes';

function loadVibes(): SavedVibe[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SavedVibe[]) : [];
	} catch {
		return [];
	}
}

function persistVibes(vibes: SavedVibe[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(vibes));
	} catch (e) {
		console.error('Failed to persist vibes to localStorage:', e);
	}
}

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
	const [notice, setNotice] = useState('');
	const [label, setLabel] = useState('');
	const [drawerOpen, setDrawerOpen] = useState(() => {
		try {
			return localStorage.getItem('lofi-drawer-open') !== 'false';
		} catch {
			return true;
		}
	});
	const [savedVibes, setSavedVibes] = useState<SavedVibe[]>([]);
	const panelRowRef = useRef<HTMLDivElement>(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia('(max-width: 480px)');
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	useEffect(() => {
		if (!drawerOpen) return;
		const handleClick = (e: MouseEvent) => {
			if (
				panelRowRef.current &&
				!panelRowRef.current.contains(e.target as Node)
			) {
				setDrawerOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [drawerOpen]);

	useEffect(() => {
		setSavedVibes(loadVibes());
	}, []);

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

	const applyVibe = useCallback(
		(vibe: SavedVibe) => {
			setActive(null);
			animateTo(vibe.values);
		},
		[animateTo]
	);

	const handleSlider = (key: keyof MoodVals, v: number) => {
		setActive(null);
		animRef.current?.cancel();
		animRef.current = null;
		setVals((prev) => ({ ...prev, [key]: v }));
	};

	const handleVibeCreated = (vibe: SavedVibe) => {
		const next = [...savedVibes.slice(-2), vibe];
		setSavedVibes(next);
		persistVibes(next);
		setNotice(`✦ "${vibe.name}" bottled`);
		setTimeout(() => setNotice(''), 2200);
	};

	const handleSave = (name: string) => {
		handleVibeCreated({ id: Date.now(), name, values: { ...valsRef.current } });
	};

	return (
		<>
			<AnimatePresence>
				{notice && (
					<motion.div
						className={styles.notice}
						initial={{ opacity: 0, y: -16, x: '-50%' }}
						animate={{ opacity: 1, y: 0, x: '-50%' }}
						exit={{ opacity: 0, y: -16, x: '-50%' }}
						transition={{ type: 'spring', stiffness: 380, damping: 28 }}
					>
						{notice}
					</motion.div>
				)}
			</AnimatePresence>
			<div
				className={`${styles.panelRow}${isMobile ? ` ${styles.panelRowMobile}` : ''}`}
				ref={panelRowRef}
			>
				<motion.div
					className={styles.panel}
					layout
					transition={{ type: 'spring', stiffness: 320, damping: 32 }}
				>
					<div className={styles.panelTopRow}>
						<button
							className={`${styles.presetsBtn}${drawerOpen ? ` ${styles.presetsBtnOpen}` : ''}`}
							onClick={() =>
								setDrawerOpen((o) => {
									const next = !o;
									try {
										localStorage.setItem('lofi-drawer-open', String(next));
									} catch {}
									return next;
								})
							}
						>
							{isMobile ? (
								drawerOpen ? (
									<PanelTopClose size={13} strokeWidth={2} />
								) : (
									<PanelTopOpen size={13} strokeWidth={2} />
								)
							) : drawerOpen ? (
								<PanelLeftClose size={13} strokeWidth={2} />
							) : (
								<PanelLeftOpen size={13} strokeWidth={2} />
							)}
							Presets
						</button>
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
						onSave={handleSave}
					/>
					<div className={styles.divider} />
					<NowPlayingBar vals={vals} />
				</motion.div>
				<motion.div
					className={styles.drawerWrapper}
					animate={
						isMobile
							? { height: drawerOpen ? 'auto' : 0, opacity: drawerOpen ? 1 : 0 }
							: { width: drawerOpen ? 178 : 0, opacity: drawerOpen ? 1 : 0 }
					}
					transition={{ type: 'spring', stiffness: 320, damping: 32 }}
					style={
						isMobile
							? { overflowX: 'visible', overflowY: 'hidden', width: '100%' }
							: { overflowX: 'hidden', overflowY: 'visible', flexShrink: 0 }
					}
				>
					<PresetDrawer
						presets={PRESETS}
						savedVibes={savedVibes}
						activePreset={activePreset}
						onSelectPreset={applyPreset}
						onSelectVibe={applyVibe}
						onDeleteVibe={(id) => {
							const next = savedVibes.filter((v) => v.id !== id);
							setSavedVibes(next);
							persistVibes(next);
						}}
					/>
				</motion.div>
			</div>
		</>
	);
}
