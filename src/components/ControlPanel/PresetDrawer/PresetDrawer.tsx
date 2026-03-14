'use client';

import type { Preset, SavedVibe } from '../../../lib/constants';
import styles from './PresetDrawer.module.css';

interface PresetDrawerProps {
	presets: Preset[];
	savedVibes: SavedVibe[];
	activePreset: string | null;
	onSelectPreset: (preset: Preset) => void;
	onSelectVibe: (vibe: SavedVibe) => void;
}

export default function PresetDrawer({
	presets,
	savedVibes,
	activePreset,
	onSelectPreset,
	onSelectVibe
}: PresetDrawerProps) {
	return (
		<div className={styles.drawerInner}>
			<div className={styles.section}>
				<span className={styles.sectionLabel}>Scenes</span>
				<div className={styles.list}>
					{presets.map((p) => (
						<button
							key={p.id}
							className={`${styles.item}${activePreset === p.id ? ` ${styles.active}` : ''}`}
							onClick={() => onSelectPreset(p)}
						>
							<span className={styles.emoji}>{p.emoji}</span>
							<span className={styles.name}>{p.name}</span>
						</button>
					))}
				</div>
			</div>
			<div className={styles.divider} />
			<div className={styles.section}>
				<span className={styles.sectionLabel}>Your Mixes</span>
				<div className={styles.list}>
					{savedVibes.length === 0 ? (
						<p className={styles.empty}>No vibes saved yet</p>
					) : (
						savedVibes.map((v) => (
							<button
								key={v.id}
								className={styles.item}
								onClick={() => onSelectVibe(v)}
							>
								<span className={styles.emoji}>✦</span>
								<span className={styles.name}>{v.name}</span>
							</button>
						))
					)}
				</div>
			</div>
		</div>
	);
}
