// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SolarDesignPro',
    template: '%s | SolarDesignPro',
  },
  description: 'Diseña sistemas fotovoltaicos profesionales en minutos',
  keywords: ['solar', 'fotovoltaico', 'diseño', 'energía', 'renovable'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}