import { motion, AnimatePresence } from 'motion/react';

import type { MoodVals } from '@/lib/constants';
import styles from './NowPlayingBar.module.css';
import { useYouTubePlayer } from '@/lib/useYoutubePlayer';
import { useAmbientAudio } from '@/lib/useAmbientAudio';

const hiddenPlayer: React.CSSProperties = {
	position: 'absolute',
	width: 1,
	height: 1,
	opacity: 0,
	pointerEvents: 'none'
};

const badgeAnim = {
	initial: { opacity: 0, scale: 0.78, x: -12 },
	animate: { opacity: 1, scale: 1, x: 0 },
	exit: { opacity: 0, scale: 0.78, x: -12 },
	transition: { type: 'spring' as const, stiffness: 400, damping: 28 }
};

const lofiBadgeAnim = {
	initial: { opacity: 0, scale: 0.78, x: -12 },
	animate: { opacity: 1, scale: 1, x: 0 },
	exit: { opacity: 0, scale: 0.78, x: -12 },
	transition: {
		type: 'spring' as const,
		stiffness: 180,
		damping: 22,
		mass: 1.2
	}
};

export default function NowPlayingBar({ vals }: { vals: MoodVals }) {
	const { containerRef, playing, ready, toggle } = useYouTubePlayer();
	const { rainDivRef, natureDayDivRef, natureNightDivRef, cozyDivRef } =
		useAmbientAudio(vals, playing);

	return (
		<div className={styles.panelFooter}>
			<div ref={containerRef} style={hiddenPlayer} />
			<div ref={rainDivRef} style={hiddenPlayer} />
			<div ref={natureDayDivRef} style={hiddenPlayer} />
			<div ref={natureNightDivRef} style={hiddenPlayer} />
			<div ref={cozyDivRef} style={hiddenPlayer} />

			<div className={styles.panelPlayRow}>
				{/* Play/pause — icon rotates and scales between states */}
				<motion.button
					className={`${styles.playBtn}${playing ? ` ${styles.playBtnOn}` : ''}`}
					onClick={toggle}
					disabled={!ready}
					title={playing ? 'Pause' : 'Play lofi stream'}
					whileHover={{
						scale: 1.1,
						transition: { type: 'spring', stiffness: 400, damping: 22 }
					}}
					whileTap={{
						scale: 0.88,
						transition: { type: 'spring', stiffness: 400, damping: 22 }
					}}
				>
					<AnimatePresence mode='wait' initial={false}>
						<motion.span
							key={playing ? 'pause' : 'play'}
							initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
							animate={{ opacity: 1, scale: 1, rotate: 0 }}
							exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
							transition={{ duration: 0.18 }}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							{playing ? '⏸' : '▶'}
						</motion.span>
					</AnimatePresence>
				</motion.button>

				{/* Badges — order: Clear/Rain, Lofi Girl, Nature, Cozy
				    popLayout pulls exiting badges out of flow so nothing snaps */}
				<div className={styles.soundBadges}>
					<AnimatePresence mode='popLayout' initial={false}>
						{playing && (
							<motion.div
								key='lofi'
								className={`${styles.badge} ${styles.badgeActive}`}
								{...lofiBadgeAnim}
								layout
							>
								♪ Lofi Girl
							</motion.div>
						)}
						{vals.warmth > 70 && (
							<motion.div
								key='cozy'
								className={`${styles.badge} ${styles.badgeActive}`}
								{...badgeAnim}
								layout
							>
								🔥 Cozy
							</motion.div>
						)}
						{vals.weather > 15 ? (
							<motion.div
								key='rain'
								className={`${styles.badge} ${styles.badgeActive}`}
								{...badgeAnim}
								layout
							>
								🌧 Rain {vals.weather}%
							</motion.div>
						) : (
							<motion.div
								key='clear'
								className={styles.badge}
								{...badgeAnim}
								layout
							>
								☀ Clear
							</motion.div>
						)}
						{vals.nature > 18 ? (
							<motion.div
								key='nature'
								className={`${styles.badge} ${styles.badgeActive}`}
								{...badgeAnim}
								layout
							>
								🍃 Nature {vals.nature}%
							</motion.div>
						) : (
							<motion.div
								key='quiet'
								className={styles.badge}
								{...badgeAnim}
								layout
							>
								🔇 Quiet
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Now playing text — crossfades vertically between states */}
			<AnimatePresence mode='wait' initial={false}>
				<motion.div
					key={playing ? 'playing' : 'idle'}
					className={`${styles.nowPlaying}${playing ? '' : ` ${styles.nowPlayingIdle}`}`}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.28, ease: 'easeInOut' }}
				>
					{playing
						? '♩ Now playing — Lofi Hip Hop Radio'
						: 'Press play for radio'}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
