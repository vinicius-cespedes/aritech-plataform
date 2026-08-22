import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aritech Platform',
  description: 'Plataforma de gestão da Aritech Soluções Industriais',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
