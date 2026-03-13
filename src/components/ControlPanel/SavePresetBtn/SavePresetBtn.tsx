import { useCallback, useEffect, useState } from 'react';

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
	disabled?: boolean;
}

export default function SavePresetBtn({
	label,
	setLabel,
	setActive,
	animateTo,
	valsRef,
	onSave,
	disabled = false
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
							disabled={disabled}
						>
							{v.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
