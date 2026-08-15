import type { ReactNode } from 'react';

export const metadata = { title: 'Aritech Platform', description: 'Industrial Operations Platform' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
