import type { MoodVals } from '@/lib/constants';
import styles from './NowPlayingBar.module.css';
import { useYouTubePlayer } from '@/lib/useYoutubePlayer';

const hiddenPlayer: React.CSSProperties = {
	position: 'absolute',
	width: 1,
	height: 1,
	opacity: 0,
	pointerEvents: 'none'
};

interface NowPlayingBarProps {
	vals: MoodVals;
	rainDivRef: React.RefObject<HTMLDivElement | null>;
	natureDayDivRef: React.RefObject<HTMLDivElement | null>;
	natureNightDivRef: React.RefObject<HTMLDivElement | null>;
	cozyDivRef: React.RefObject<HTMLDivElement | null>;
}

export default function NowPlayingBar({
	vals,
	rainDivRef,
	natureDayDivRef,
	natureNightDivRef,
	cozyDivRef
}: NowPlayingBarProps) {
	const { containerRef, playing, ready, toggle } = useYouTubePlayer();

	return (
		<div className={styles.panelFooter}>
			<div ref={containerRef} style={hiddenPlayer} />
			<div ref={rainDivRef} style={hiddenPlayer} />
			<div ref={natureDayDivRef} style={hiddenPlayer} />
			<div ref={natureNightDivRef} style={hiddenPlayer} />
			<div ref={cozyDivRef} style={hiddenPlayer} />

			<div className={styles.panelPlayRow}>
				<button
					className={`${styles.playBtn}${playing ? ` ${styles.playBtnOn}` : ''}`}
					onClick={toggle}
					disabled={!ready}
					title={playing ? 'Pause' : 'Play lofi stream'}
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
					{vals.warmth > 70 && (
						<div className={`${styles.badge} ${styles.badgeActive}`}>
							🔥 Cozy
						</div>
					)}
					{playing && (
						<div className={`${styles.badge} ${styles.badgeActive}`}>
							♪ Lofi Girl
						</div>
					)}
				</div>
			</div>
			<div
				className={`${styles.nowPlaying}${playing ? '' : ` ${styles.nowPlayingIdle}`}`}
			>
				{playing ? '♩ Now playing — Lofi Hip Hop Radio' : 'Silence... for now'}
			</div>
		</div>
	);
}
