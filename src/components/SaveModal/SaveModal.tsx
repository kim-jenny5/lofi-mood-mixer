'use client';

// import { MoodValues } from '@/types';
import { useState } from 'react';

export default function SaveModal({
	// values,
	onClose,
	onSave
}: {
	// values: MoodValues;
	onClose: () => void;
	onSave: (name: string) => void;
}) {
	const [name, setName] = useState('');
	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				background: 'rgba(10,8,20,0.75)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 100,
				backdropFilter: 'blur(4px)'
			}}
			onClick={onClose}
		>
			<div
				style={{
					background: 'rgba(22,18,40,0.96)',
					border: '1px solid rgba(255,200,80,0.2)',
					borderRadius: '16px',
					padding: '28px 32px',
					width: '300px',
					boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '22px',
						color: '#ffd060',
						marginBottom: '6px'
					}}
				>
					bottle this vibe 🏕️
				</div>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontSize: '13px',
						color: 'rgba(255,235,190,0.5)',
						marginBottom: '18px'
					}}
				>
					give this moment a name
				</div>
				<input
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) =>
						e.key === 'Enter' && name.trim() && onSave(name.trim())
					}
					placeholder='e.g. thursday 2am bliss'
					style={{
						width: '100%',
						boxSizing: 'border-box',
						background: 'rgba(255,255,255,0.06)',
						border: '1px solid rgba(255,200,80,0.25)',
						borderRadius: '8px',
						padding: '10px 14px',
						fontFamily: "'Caveat', cursive",
						fontSize: '15px',
						color: '#fff8e8',
						outline: 'none',
						marginBottom: '16px'
					}}
				/>
				<div style={{ display: 'flex', gap: '10px' }}>
					<button
						onClick={onClose}
						style={{
							flex: 1,
							padding: '9px',
							background: 'rgba(255,255,255,0.06)',
							border: '1px solid rgba(255,255,255,0.1)',
							borderRadius: '8px',
							fontFamily: "'Caveat', cursive",
							fontSize: '14px',
							color: 'rgba(255,255,255,0.5)',
							cursor: 'pointer'
						}}
					>
						nevermind
					</button>
					<button
						onClick={() => name.trim() && onSave(name.trim())}
						disabled={!name.trim()}
						style={{
							flex: 1,
							padding: '9px',
							background: name.trim()
								? 'rgba(255,200,80,0.2)'
								: 'rgba(255,255,255,0.04)',
							border: `1px solid ${name.trim() ? 'rgba(255,200,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
							borderRadius: '8px',
							fontFamily: "'Caveat', cursive",
							fontSize: '14px',
							color: name.trim() ? '#ffd060' : 'rgba(255,255,255,0.2)',
							cursor: name.trim() ? 'pointer' : 'default',
							transition: 'all 0.2s'
						}}
					>
						save it ✓
					</button>
				</div>
			</div>
		</div>
	);
}
