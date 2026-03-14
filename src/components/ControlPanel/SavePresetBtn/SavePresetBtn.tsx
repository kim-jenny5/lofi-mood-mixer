import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import styles from './SavePresetBtn.module.css';

interface SavePresetBtnProps {
	label: string;
	setLabel: React.Dispatch<React.SetStateAction<string>>;
	onSave: (name: string) => void;
}

export default function SavePresetBtn({
	label,
	setLabel,
	onSave
}: SavePresetBtnProps) {
	const [showInput, setShowInput] = useState(false);

	const handleSave = () => {
		const name = label.trim();
		if (!name) return;
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
						transition={{ duration: 0.12, ease: 'easeInOut' }}
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
						transition={{ duration: 0.12, ease: 'easeInOut' }}
					>
						✦ Bottle this vibe
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
