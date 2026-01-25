import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PageTransition } from "@/components/ui/page-transition";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EdTech LMS',
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
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}

