import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RootPageTransition } from "@/components/ui/root-page-transition";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShockLearn LMS',
  description: 'AI-powered Learning Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootPageTransition>{children}</RootPageTransition>
      </body>
    </html>
  );
}

