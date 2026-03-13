import { useCallback, useState } from 'react';

import type { MoodVals, SavedVibe } from '../../../lib/constants';
import styles from './SavePresetBtn.module.css';

interface SavePresetBtnProps {
	label: string;
	setLabel: React.Dispatch<React.SetStateAction<string>>;
	setActive: React.Dispatch<React.SetStateAction<string | null>>;
	animateTo: (target: MoodVals, onDone?: () => void) => void;
	valsRef: { current: MoodVals };
}

export default function SavePresetBtn({
	label,
	setLabel,
	setActive,
	animateTo,
	valsRef
}: SavePresetBtnProps) {
	const [savedVibes, setSaved] = useState<SavedVibe[]>([]);
	const [showInput, setShowInput] = useState(false);
	const [notice, setNotice] = useState('');

	const applyVibe = useCallback(
		(vibe: SavedVibe) => {
			setActive(null);
			animateTo(vibe.values);
		},
		[animateTo]
	);

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
						>
							{v.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
