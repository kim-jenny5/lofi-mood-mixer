import type { SliderConfig } from './constants';
import styles from './LofiMoodMixer.module.scss';

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
				type='range'
				min={0}
				max={100}
				value={value}
				className={styles.moodSlider}
				style={{ '--p': `${value}%` } as React.CSSProperties}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		</div>
	);
}
