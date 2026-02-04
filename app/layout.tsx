import type { Metadata } from "next";
import { Vazirmatn, Geist_Mono } from "next/font/google"; // 1. Import Vazirmatn
import "./globals.css";
import { ThemeProvider } from './providers';

// 2. Configure Vazirmatn (The best free Persian font)
const vazirMatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

// Keep Mono for code/numbers if you like, or remove it
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "پنل استراتژی طالب", // Updated title
  description: "داشبورد مانیتورینگ بازار اختیار معامله",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* 3. Set lang="fa" and dir="rtl" for proper alignment */
    /* 4. suppressHydrationWarning is needed for next-themes to work without errors */
    <html className='dark' lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirMatn.className} antialiased font-sans`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
