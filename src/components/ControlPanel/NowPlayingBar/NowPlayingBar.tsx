import { useState } from 'react';

import type { MoodVals } from '@/lib/constants';
import styles from './NowPlayingBar.module.css';

export default function NowPlayingBar({ vals }: { vals: MoodVals }) {
	const [playing, setPlaying] = useState(false);

	return (
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
	);
}
