import type { Metadata, Viewport } from 'next';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outfitly. Kurasi Fashion Lokal Indonesia',
  description:
    'Kurasi busana UMKM Bandung, Solo, Yogya, Pekalongan, dan Tasikmalaya dengan panduan ukuran cm nyata, undertone kulit, dan lemari digital.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#162D24',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-cream">{children}</body>
    </html>
  );
}
