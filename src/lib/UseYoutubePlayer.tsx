import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
	}
}

const LOFI_GIRL_VIDEO_ID = 'jfKfPfyJRdk';

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

export function useYouTubePlayer() {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<YT.Player | null>(null);
	const [playing, setPlaying] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		let cancelled = false;

		loadYTScript().then(() => {
			if (cancelled || !containerRef.current) return;

			playerRef.current = new window.YT.Player(containerRef.current, {
				videoId: LOFI_GIRL_VIDEO_ID,
				playerVars: {
					autoplay: 0,
					controls: 0,
					disablekb: 1,
					fs: 0,
					iv_load_policy: 3,
					modestbranding: 1,
					rel: 0
				},
				events: {
					onReady: () => {
						if (!cancelled) setReady(true);
					},
					onStateChange: (e) => {
						if (!cancelled) {
							setPlaying(e.data === window.YT.PlayerState.PLAYING);
						}
					}
				}
			});
		});

		return () => {
			cancelled = true;
			playerRef.current?.destroy();
			playerRef.current = null;
		};
	}, []);

	const toggle = useCallback(() => {
		const player = playerRef.current;
		if (!player || !ready) return;
		const state = player.getPlayerState();
		if (state === window.YT.PlayerState.PLAYING) {
			player.pauseVideo();
		} else {
			player.playVideo();
		}
	}, [ready]);

	return { containerRef, playing, ready, toggle };
}
