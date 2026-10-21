import type { Metadata } from 'next';
import './nopalpante.css';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (productionHost ? `https://${productionHost}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Untuk Nopalpante — cerita ulang tahun kecil',
  description: 'Kejutan ulang tahun kecil dari Putriimut untuk Nopalpante.',
  openGraph: { title: 'Untuk Nopalpante', description: 'Kejutan ulang tahun kecil dari Putriimut.' },
  twitter: { card: 'summary', title: 'Untuk Nopalpante', description: 'Kejutan ulang tahun kecil dari Putriimut.' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
