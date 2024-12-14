import type { Metadata } from 'next';
import './globals.css';

import { Onest } from 'next/font/google';
import { Toaster } from 'sonner';

// If loading a variable font, you don't need to specify the font weight
const onest = Onest({
  subsets: ['latin'],
  adjustFontFallback: true,
  preload: true,
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spiral Flow',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onest.className} dark h-screen w-screen antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
