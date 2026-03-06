export default function NowPlaying({
	isPlaying,
	onToggle
}: {
	isPlaying: boolean;
	onToggle: () => void;
}) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				paddingTop: '10px',
				borderTop: '1px solid rgba(255,235,180,0.12)',
				marginTop: '4px'
			}}
		>
			<button
				onClick={onToggle}
				style={{
					width: '34px',
					height: '34px',
					borderRadius: '50%',
					background: isPlaying
						? 'rgba(255,200,80,0.25)'
						: 'rgba(255,255,255,0.08)',
					border: '1.5px solid rgba(255,200,80,0.5)',
					color: '#ffd060',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '13px',
					transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
					transform: isPlaying ? 'scale(1.08)' : 'scale(1)',
					flexShrink: 0
				}}
			>
				{isPlaying ? '⏸' : '▶'}
			</button>
			<div style={{ flex: 1, overflow: 'hidden' }}>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '12px',
						color: 'rgba(255,235,190,0.5)',
						marginBottom: '1px'
					}}
				>
					now playing ♪
				</div>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '13.5px',
						color: 'rgba(255,235,190,0.85)',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}
				>
					{isPlaying ? 'lofi camping radio · live' : '—  tap to tune in  —'}
				</div>
			</div>
			{isPlaying && (
				<div
					style={{
						display: 'flex',
						gap: '2px',
						alignItems: 'flex-end',
						height: '18px',
						flexShrink: 0
					}}
				>
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							style={{
								width: '3px',
								background: '#ffd060',
								borderRadius: '2px',
								opacity: 0.8,
								animation: `eq-bar ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
								animationDelay: `${i * 0.1}s`
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
