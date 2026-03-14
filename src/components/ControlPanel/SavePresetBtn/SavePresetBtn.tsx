import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import type { MoodVals, SavedVibe } from '../../../lib/constants';
import styles from './SavePresetBtn.module.css';

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

interface SavePresetBtnProps {
	label: string;
	setLabel: React.Dispatch<React.SetStateAction<string>>;
	setActive: React.Dispatch<React.SetStateAction<string | null>>;
	animateTo: (target: MoodVals, onDone?: () => void) => void;
	valsRef: { current: MoodVals };
	onSave: (name: string) => void;
}

export default function SavePresetBtn({
	label,
	setLabel,
	setActive,
	animateTo,
	valsRef,
	onSave
}: SavePresetBtnProps) {
	const [savedVibes, setSaved] = useState<SavedVibe[]>([]);
	const [showInput, setShowInput] = useState(false);

	// Hydrate from localStorage on mount
	useEffect(() => {
		setSaved(loadVibes());
	}, []);

	const applyVibe = useCallback(
		(vibe: SavedVibe) => {
			setActive(null);
			animateTo(vibe.values);
		},
		[animateTo, setActive]
	);

	const handleSave = () => {
		const name = label.trim();
		if (!name) return;

		const next: SavedVibe[] = [
			...savedVibes.slice(-4),
			{ id: Date.now(), name, values: { ...valsRef.current } }
		];

		setSaved(next);
		persistVibes(next);
		setLabel('');
		setShowInput(false);
		onSave(name);
	};

	return (
		<div className={styles.saveSection}>
			<AnimatePresence mode='wait' initial={false}>
				{showInput ? (
					<motion.div
						key='pill'
						className={styles.pillWrapper}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.15, ease: 'easeInOut' }}
					>
						<button
							className={styles.pillDismiss}
							onClick={() => {
								setShowInput(false);
								setLabel('');
							}}
							title='Cancel'
						>
							✕
						</button>
						<div className={styles.pill}>
							<input
								className={styles.pillInput}
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
								className={`${styles.pillSave}${label.trim() ? ` ${styles.pillSaveReady}` : ''}`}
								onClick={handleSave}
								disabled={!label.trim()}
								title='Save vibe'
							>
								Save
							</button>
						</div>
					</motion.div>
				) : (
					<motion.button
						key='bottle'
						className={styles.bottleBtn}
						onClick={() => setShowInput(true)}
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15, ease: 'easeInOut' }}
					>
						✦ Bottle this vibe
					</motion.button>
				)}
			</AnimatePresence>
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
	);
}
