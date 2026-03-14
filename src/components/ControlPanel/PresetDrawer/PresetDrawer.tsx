'use client';

import type { Preset, SavedVibe } from '../../../lib/constants';
import styles from './PresetDrawer.module.css';

interface PresetDrawerProps {
	presets: Preset[];
	savedVibes: SavedVibe[];
	activePreset: string | null;
	onSelectPreset: (preset: Preset) => void;
	onSelectVibe: (vibe: SavedVibe) => void;
	onDeleteVibe: (id: number) => void;
}

export default function PresetDrawer({
	presets,
	savedVibes,
	activePreset,
	onSelectPreset,
	onSelectVibe,
	onDeleteVibe
}: PresetDrawerProps) {
	return (
		<div className={styles.drawerInner}>
			<div className={styles.section}>
				<span className={styles.sectionLabel}>Factory</span>
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
				<span className={styles.sectionLabel}>Your Vibes</span>
				<div className={styles.list}>
					{savedVibes.length === 0 ? (
						<p className={styles.empty}>No vibes saved yet</p>
					) : (
						savedVibes.map((v) => (
							<div key={v.id} className={styles.itemWrapper}>
								<button className={styles.item} onClick={() => onSelectVibe(v)}>
									<span className={styles.emoji}>✦</span>
									<span className={styles.name}>{v.name}</span>
								</button>
								<button
									className={styles.deleteBtn}
									onClick={() => onDeleteVibe(v.id)}
									title='Delete'
								>
									✕
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
