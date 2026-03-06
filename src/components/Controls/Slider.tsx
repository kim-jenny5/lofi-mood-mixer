export default function Slider({
	label,
	leftLabel,
	rightLabel,
	value,
	onChange,
	icon
}: {
	label: string;
	leftLabel: string;
	rightLabel: string;
	value: number;
	onChange: (value: number) => void;
	icon: string;
}) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '4px'
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '6px',
					fontFamily: "'Caveat', cursive",
					fontSize: '13px',
					color: 'rgba(255,245,220,0.7)',
					letterSpacing: '0.5px'
				}}
			>
				<span style={{ fontSize: '14px' }}>{icon}</span>
				<span style={{ textTransform: 'lowercase' }}>{label}</span>
			</div>
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '11px',
						color: 'rgba(255,235,190,0.5)',
						minWidth: '44px',
						textAlign: 'right'
					}}
				>
					{leftLabel}
				</span>
				<div
					style={{
						flex: 1,
						position: 'relative',
						height: '20px',
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<input
						type='range'
						min='0'
						max='100'
						value={Math.round(value * 100)}
						onChange={(e) => onChange(parseInt(e.target.value) / 100)}
						style={{
							width: '100%',
							height: '3px',
							appearance: 'none',
							background: `linear-gradient(to right, rgba(255,210,100,0.8) ${value * 100}%, rgba(255,255,255,0.12) ${value * 100}%)`,
							borderRadius: '2px',
							outline: 'none',
							cursor: 'pointer'
						}}
					/>
				</div>
				<span
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '11px',
						color: 'rgba(255,235,190,0.5)',
						minWidth: '44px'
					}}
				>
					{rightLabel}
				</span>
			</div>
		</div>
	);
}
