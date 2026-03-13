'use client';

import { useState, useEffect, useRef } from 'react';

import Header from './Header/Header';
import ControlPanel from './ControlPanel/ControlPanel';

// import { engine } from './AudioEngine';
import { INIT } from './constants';
import type { MoodVals } from './constants';
import CampingScene from './CampingScene';
import styles from './LofiMoodMixer.module.css';

export default function LofiMoodMixer() {
	const [vals, setVals] = useState<MoodVals>(INIT);
	const valsRef = useRef(vals);
	const animRef = useRef<{ cancel: () => void } | null>(null);

	useEffect(() => {
		valsRef.current = vals;
	}, [vals]);

	useEffect(() => {
		return () => {
			animRef.current?.cancel();
		};
	}, []);

	// Audio sync
	// useEffect(() => {
	// 	if (playing) {
	// 		engine.setRain(vals.weather / 100);
	// 		engine.setNature(vals.nature / 100);
	// 	}
	// }, [vals.weather, vals.nature, playing]);

	// const togglePlay = () => {
	// 	if (!playing) {
	// 		engine.init();
	// 		engine.play();
	// 	} else engine.pause();
	// 	setPlaying((p) => !p);
	// };

	return (
		<div className={styles.app}>
			<CampingScene {...vals} />
			<Header />
			<ControlPanel
				vals={vals}
				animRef={animRef}
				valsRef={valsRef}
				setVals={setVals}
			/>
		</div>
	);
}
