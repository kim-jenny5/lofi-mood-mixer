import { useRef, useEffect } from 'react';
import type { SliderConfig } from '../constants';
import styles from './ControlPanel.module.css';

interface MoodSliderProps {
	config: SliderConfig;
	value: number;
	onChange: (value: number) => void;
}

export default function MoodSlider({
	config,
	value,
	onChange
}: MoodSliderProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.style.setProperty('--p', `${value}%`);
	}, [value]);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = Number(e.target.value);
		e.currentTarget.style.setProperty('--p', `${v}%`);
		onChange(v);
	};

	return (
		<div className={styles.sliderRow}>
			<div className={styles.sliderHead}>
				<span className={styles.sliderLabel}>{config.label}</span>
				<div className={styles.sliderEnds}>
					<span>{config.left}</span>
					<span>{config.right}</span>
				</div>
			</div>
			<input
				ref={inputRef}
				type='range'
				min={0}
				max={100}
				value={value}
				className={styles.moodSlider}
				style={{ '--p': `${value}%` } as React.CSSProperties}
				onChange={handleInput}
			/>
		</div>
	);
}
