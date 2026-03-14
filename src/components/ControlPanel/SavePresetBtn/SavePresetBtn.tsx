import { useState } from 'react';

import type { MoodVals, SavedVibe } from '../../../lib/constants';
import styles from './SavePresetBtn.module.css';

interface SavePresetBtnProps {
	valsRef: { current: MoodVals };
	onVibeCreated: (vibe: SavedVibe) => void;
}

export default function SavePresetBtn({
	valsRef,
	onVibeCreated
}: SavePresetBtnProps) {
	const [showInput, setShowInput] = useState(false);
	const [label, setLabel] = useState('');

	const handleSave = () => {
		const name = label.trim();
		if (!name) return;
		onVibeCreated({ id: Date.now(), name, values: { ...valsRef.current } });
		setLabel('');
		setShowInput(false);
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
		</div>
	);
}
