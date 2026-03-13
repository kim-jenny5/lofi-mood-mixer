import { useEffect, useRef } from 'react';
import type { MoodVals } from '@/lib/constants';

const VIDEOS = {
	rain: '42M3esYyHdw',
	natureDay: 'cAbTzWBhZPM', // time 10%–70%
	natureNight: 'oDdVHn5Pvm0', // time <10% or >70%
	cozy: 'mKCieTImjvU' // warmth >70%
} as const;

const MAX_VOL = 50;

function loadYTScript(): Promise<void> {
	return new Promise((resolve) => {
		if (window.YT?.Player) {
			resolve();
			return;
		}
		if (document.getElementById('yt-iframe-api')) {
			const prev = window.onYouTubeIframeAPIReady;
			window.onYouTubeIframeAPIReady = () => {
				prev?.();
				resolve();
			};
			return;
		}
		window.onYouTubeIframeAPIReady = resolve;
		const tag = document.createElement('script');
		tag.id = 'yt-iframe-api';
		tag.src = 'https://www.youtube.com/iframe_api';
		document.head.appendChild(tag);
	});
}

function makePlayer(
	el: HTMLDivElement,
	videoId: string,
	onReady?: () => void
): YT.Player {
	return new window.YT.Player(el, {
		videoId,
		playerVars: {
			autoplay: 1,
			controls: 0,
			disablekb: 1,
			fs: 0,
			iv_load_policy: 3,
			modestbranding: 1,
			rel: 0,
			loop: 1,
			playlist: videoId,
			mute: 1
		},
		events: {
			onReady: (e) => {
				e.target.mute();
				e.target.playVideo();
				e.target.unMute();
				onReady?.();
			}
		}
	});
}

function computeVolumes(vals: MoodVals) {
	const t = vals.time / 100;
	const isDayNature = t >= 0.1 && t <= 0.7;
	const cozyFrac = vals.warmth > 70 ? (vals.warmth - 70) / 30 : 0;

	return {
		rain: (vals.weather / 100) * MAX_VOL,
		natureDay: isDayNature ? (vals.nature / 100) * MAX_VOL : 0,
		natureNight: !isDayNature ? (vals.nature / 100) * MAX_VOL : 0,
		cozy: cozyFrac * MAX_VOL
	};
}

export function useAmbientAudio(vals: MoodVals) {
	const rainDivRef = useRef<HTMLDivElement>(null);
	const natureDayDivRef = useRef<HTMLDivElement>(null);
	const natureNightDivRef = useRef<HTMLDivElement>(null);
	const cozyDivRef = useRef<HTMLDivElement>(null);

	const players = useRef<Partial<Record<keyof typeof VIDEOS, YT.Player>>>({});
	const valsRef = useRef(vals);

	useEffect(() => {
		valsRef.current = vals;
	}, [vals]);

	useEffect(() => {
		let cancelled = false;

		loadYTScript().then(() => {
			if (cancelled) return;

			const divs: Record<keyof typeof VIDEOS, HTMLDivElement | null> = {
				rain: rainDivRef.current,
				natureDay: natureDayDivRef.current,
				natureNight: natureNightDivRef.current,
				cozy: cozyDivRef.current
			};

			(Object.keys(VIDEOS) as (keyof typeof VIDEOS)[]).forEach((key) => {
				const el = divs[key];
				if (!el) return;
				players.current[key] = makePlayer(el, VIDEOS[key], () => {
					const vols = computeVolumes(valsRef.current);
					players.current[key]?.setVolume(vols[key]);
				});
			});
		});

		return () => {
			cancelled = true;
			Object.values(players.current).forEach((p) => p?.destroy());
			players.current = {};
		};
	}, []);

	useEffect(() => {
		const vols = computeVolumes(vals);
		(Object.keys(vols) as (keyof typeof VIDEOS)[]).forEach((key) => {
			players.current[key]?.setVolume(vols[key]);
		});
	}, [vals]);

	return { rainDivRef, natureDayDivRef, natureNightDivRef, cozyDivRef };
}
