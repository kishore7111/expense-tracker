import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'SpendWise',
  description: 'Track your expenses with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/geist-sans/geist-sans@1.3.0/css/geist-sans.min.css"
          integrity="sha384-NBMqoy60rTzTOpGO2YjdpAbf29iOKsB31FAdh23iLfr2Gv29k6TS3+K3Y5fVjvM1"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/geist-mono/geist-mono@1.1.0/css/geist-mono.min.css"
          integrity="sha384-g2wwDPK3nLh1K3l2p22bJjL+5x2sF/1sOITXGSb8P1Q0gV3I/s/XU/GkEwRz3K+c"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
