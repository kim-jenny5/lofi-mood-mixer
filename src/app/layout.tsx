import './globals.css';

import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
	variable: '--font-open-sans',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: 'Lofi Mood Mixer',
	description:
		'A cozy lofi music mixer inspired by the classic “lofi beats to study to.” Adjust the time of day, warmth of the season, and nature sounds to create your perfect atmosphere.',
	openGraph: {
		title: 'Lofi Mood Mixer',
		description:
			'Shape your perfect focus vibe. Adjust time of day, seasonal warmth, and nature sounds around a cozy lofi campfire.',
		type: 'website'
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${openSans.variable} antialiased`}>{children}</body>
		</html>
	);
}
