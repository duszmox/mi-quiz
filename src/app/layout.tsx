import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "./_components/Navbar";

export const metadata: Metadata = {
  title: "MI Quiz - Test Your AI Knowledge",
  description:
    "Practice and test your knowledge on Artificial Intelligence topics",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <TRPCReactProvider>
          <Navbar />
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
