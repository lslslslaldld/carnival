import type { Metadata } from 'next';
import './globals.css';
import { AmplifyProvider } from '@/components/AmplifyProvider';
import { HeaderActions } from '@/components/HeaderActions';

export const metadata: Metadata = { title: 'Carnival', description: 'Carnival admin and content management app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AmplifyProvider><header className="site-header"><div className="container nav"><a href="/" className="brand">Carnival</a><nav><a href="/">Home</a><a href="/admin">Admin</a></nav><div className="header-actions"><HeaderActions /></div></div></header>{children}</AmplifyProvider></body></html>;
}
