import type { ReactNode } from 'react';
import './globals.css';
export const metadata = { title: 'CampusOS', description: 'Campus operations platform' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
