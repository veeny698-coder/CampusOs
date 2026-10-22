import type { ReactNode } from 'react';
export const metadata = { title: 'CampusOS', description: 'Campus operations platform' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body style={{fontFamily:'system-ui',margin:0,background:'#0b1020',color:'#f8fafc'}}>{children}</body></html>; }
