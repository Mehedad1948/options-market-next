'use cache';

import type { Metadata } from 'next';
import { Vazirmatn, Geist_Mono } from 'next/font/google'; // 1. Import Vazirmatn
import './globals.css';
import { ThemeProvider } from './providers';
import Header from './components/ui/Header';
import { UserProvider } from './providers/user-context';
import { getUser } from '@/lib/services/getUser';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import LayoutServerPromises from './providers/layout-server-promises';

// 2. Configure Vazirmatn (The best free Persian font)
const vazirMatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
  display: 'swap',
});

// Keep Mono for code/numbers if you like, or remove it
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  // 1. Optimized Title: Includes Brand + Main Keyword + Value Proposition
  title: {
    template: '%s | آپشن‌یار',
    default: 'آپشن‌یار | ریسک محدود، پاداش نامحدود',
  },

  // 2. Rich Description: Explains WHAT it is, HOW it helps (Antifragile), and the OUTCOME (Limited Risk/Unlimited Reward)
  description:
    'پلتفرم هوشمند برای شکار فرصت‌های پیش‌بینی‌نشده و سودهای نامتقارن (Asymmetric Payoffs). طراحی شده برای سرمایه‌گذاری بلندمدت و بهره‌برداری از نوسانات بزرگ، نه نوسان‌گیری روزانه.',

  // 3. Keywords: Crucial for search engines to understand the niche
  keywords: [
    'آپشن یار',
    'OptionYar',
    'اختیار معامله',
    'بورس تهران',
    'مدیریت ریسک',
    'استراتژی نامتقارن',
    'Antifragile',
    'نسیم طالب',
    'بلک شولز',
    'سود مرکب',
  ],

  // 4. Authors & Creator info
  authors: [{ name: 'OptionYar Team' }],
  creator: 'OptionYar',

  // 5. Open Graph (For Telegram, LinkedIn, WhatsApp previews)
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://opyar.ir', // Replace with your actual domain
    title: 'آپشن‌یار | ریسک محدود، پاداش نامحدود',
    description:
      'ابزار تخصصی برای کشف «قوی سیاه» و فرصت‌های پنهان بازار. به جای درگیری با نوسانات خرد، در موقعیت‌هایی با پتانسیل رشد نامحدود و بلندمدت سرمایه‌گذاری کنید.',
    siteName: 'آپشن‌یار',
    // Add an image to your public folder named 'og-image.jpg' (1200x630px is best)
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OptionYar Dashboard Preview',
      },
    ],
  },

  // 6. Twitter Card (For X/Twitter previews)
  twitter: {
    card: 'summary_large_image',
    title: 'آپشن‌یار | ریسک محدود، پاداش نامحدود',
    description:
      'داشبورد حرفه‌ای برای معامله‌گران اختیار معامله. جایی که نوسان دوست شماست.',
    images: ['/og-image.png'], // Reuses the OG image
  },

  // 7. Robots: Ensures Google indexes the page
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 8. Icons: Standard favicons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
  navbar,
}: Readonly<{
  children: React.ReactNode;
  navbar: React.ReactNode;
}>) {
  return (
    <html className='dark' lang='fa' dir='rtl' suppressHydrationWarning>
      <body className={`${vazirMatn.className} antialiased font-sans`}>
        <Suspense>
          <Toaster position='top-center' richColors closeButton />
          <ThemeProvider>
            <NuqsAdapter>
              <Suspense>{navbar}</Suspense>
              
              <Suspense>{children}</Suspense>
            </NuqsAdapter>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
