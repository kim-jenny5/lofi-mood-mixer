'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_VALUES } from '@/lib/presets';
import Scene from '@/components/Scene/Scene';
import SaveModal from '@/components/SaveModal/SaveModal';
import type { MoodValues, Preset, MoodKey } from '../types';
import Controls from '@/components/Controls/Controls';

export default function LofiCamping() {
	const [values, setValues] = useState({ ...DEFAULT_VALUES });
	const [displayValues, setDisplayValues] = useState({ ...DEFAULT_VALUES });
	const [savedVibes, setSavedVibes] = useState<Preset[]>([]);
	const [showSave, setShowSave] = useState(false);
	const [toastMsg, setToastMsg] = useState<string | null>(null);
	const animRef = useRef<number>(0);
	const targetRef = useRef<MoodValues>(DEFAULT_VALUES);
	const currentRef = useRef<MoodValues>(DEFAULT_VALUES);

	// Smooth animation loop
	useEffect(() => {
		const animate = () => {
			const keys = Object.keys(targetRef.current) as MoodKey[];
			let changed = false;
			const next = { ...currentRef.current };
			for (const k of keys) {
				const diff = targetRef.current[k] - currentRef.current[k];
				if (Math.abs(diff) > 0.001) {
					next[k] = currentRef.current[k] + diff * 0.07;
					changed = true;
				} else {
					next[k] = targetRef.current[k];
				}
			}
			if (changed) {
				currentRef.current = next;
				setDisplayValues({ ...next });
			}
			animRef.current = requestAnimationFrame(animate);
		};
		animRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animRef.current);
	}, []);

	const handleSaveVibe = useCallback(
		(name: string) => {
			const vibe: Preset = { name, emoji: '🔖', values: { ...values } };
			setSavedVibes((prev) => [...prev, vibe]);
			setShowSave(false);
			setToastMsg(`"${name}" saved ✓`);
			setTimeout(() => setToastMsg(null), 2500);
		},
		[values]
	);

	const dv = displayValues;

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				position: 'relative',
				fontFamily: "'Caveat', cursive",
				background: '#080c1a'
			}}
		>
			{/* Google Fonts */}
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Libre+Baskerville:ital@1&display=swap');
  
        * { box-sizing: border-box; margin: 0; padding: 0; }
  
        input[type=range] { -webkit-appearance: none; appearance: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ffd060;
          border: 2px solid rgba(255,210,100,0.4);
          box-shadow: 0 0 8px rgba(255,200,60,0.5);
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 14px rgba(255,200,60,0.8);
        }
        input[type=range]::-webkit-slider-thumb:active {
          transform: scale(1.5);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ffd060;
          border: 2px solid rgba(255,210,100,0.4);
          cursor: pointer;
        }
  
        @keyframes eq-bar {
          from { height: 4px; }
          to   { height: 16px; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateY(10px) scale(0.95); }
          15%  { opacity: 1; transform: translateY(0) scale(1); }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes steam-rise {
          0%   { transform: translateY(0) scaleX(1); opacity: 0.6; }
          100% { transform: translateY(-24px) scaleX(0.6); opacity: 0; }
        }
      `}</style>

			{/* Background scene */}
			<div style={{ position: 'absolute', inset: 0 }}>
				<Scene
					energy={dv.energy}
					weather={dv.weather}
					warmth={dv.warmth}
					time={dv.time}
					nature={dv.nature}
				/>
			</div>

			{/* Vignette */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					background:
						'radial-gradient(ellipse at 55% 50%, transparent 40%, rgba(5,4,15,0.55) 100%)'
				}}
			/>

			{/* Top header */}
			<div
				style={{
					position: 'absolute',
					top: '24px',
					left: '50%',
					transform: 'translateX(-50%)',
					textAlign: 'center',
					pointerEvents: 'none',
					animation: 'fade-in-up 0.8s ease both'
				}}
			>
				<div
					style={{
						fontFamily: "'Caveat', cursive",
						fontWeight: 700,
						fontSize: 'clamp(28px, 5vw, 44px)',
						color: '#fff8e0',
						textShadow: '0 2px 20px rgba(255,180,40,0.3)',
						letterSpacing: '2px',
						lineHeight: 1
					}}
				>
					Lofi Camping
				</div>
				<div
					style={{
						fontFamily: "'Libre Baskerville', serif",
						fontStyle: 'italic',
						fontSize: 'clamp(11px, 1.8vw, 14px)',
						color: 'rgba(255,235,180,0.45)',
						letterSpacing: '3px',
						marginTop: '5px'
					}}
				>
					tune out. tune in. stay wild.
				</div>
			</div>

			<Controls
				values={values}
				setValues={setValues}
				savedVibes={savedVibes}
				setShowSave={setShowSave}
				targetRef={targetRef}
			/>

			{/* Save modal */}
			{showSave && (
				<SaveModal
					// values={values}
					onClose={() => setShowSave(false)}
					onSave={handleSaveVibe}
				/>
			)}

			{/* Toast */}
			{toastMsg && (
				<div
					style={{
						position: 'fixed',
						bottom: '32px',
						left: '50%',
						transform: 'translateX(-50%)',
						background: 'rgba(20,16,38,0.9)',
						border: '1px solid rgba(255,200,80,0.25)',
						borderRadius: '24px',
						padding: '10px 20px',
						fontFamily: "'Caveat', cursive",
						fontSize: '15px',
						color: '#ffd060',
						boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
						animation: 'toast-in 2.5s ease forwards',
						pointerEvents: 'none',
						whiteSpace: 'nowrap',
						zIndex: 200
					}}
				>
					{toastMsg}
				</div>
			)}
		</div>
	);
}
