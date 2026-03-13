'use client';

import { useEffect, useRef, useState } from 'react';

import CampingScene from './CampingScene';
import type { MoodVals } from '../lib/constants';
import { INIT } from '../lib/constants';
import ControlPanel from './ControlPanel/ControlPanel';
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

	return (
		<div className={styles.app}>
			<CampingScene {...vals} />
			<ControlPanel
				vals={vals}
				animRef={animRef}
				valsRef={valsRef}
				setVals={setVals}
			/>
		</div>
	);
}
