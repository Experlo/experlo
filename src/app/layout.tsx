'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from '@/context/UserContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ExpertModalProvider } from '@/context/ExpertModalContext';
import Notifications from '@/shared/components/ui/Notifications';
import { Toaster } from 'sonner';
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}>
        <UserProvider>
          <NotificationProvider>
            <ExpertModalProvider>
              {children}
              <Notifications />
              <Toaster position="top-right" />
            </ExpertModalProvider>
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
