import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SWRegister } from '@/app/sw-register';
import { ClientThemeInit } from '@/app/theme-init';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { AuthSync } from '@/components/auth/AuthSync';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';

export const metadata: Metadata = {
  title: 'beetreez designes',
  description: 'Create stunning designs with powerful editing tools',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark'),document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <SessionProvider>
          {children}
          <UserOnboarding />
          <AuthSync />
        </SessionProvider>
        <SWRegister />
        <ClientThemeInit />
      </body>
    </html>
  );
}
