import type { Metadata } from "next";
import { Montserrat_Alternates } from 'next/font/google'
import { ClerkProvider, } from '@clerk/nextjs'

import "./globals.css";


export const montserrat = Montserrat_Alternates({
  weight: ["200", "400", "600", "700", "900"],
  variable: "--montserrat-font",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body
          className={`${montserrat.variable} antialiased bg-[url('/assets/img/background.svg')] bg-cover bg-center bg-repeat`}
        >
          <div className="w-full min-h-screen flex justify-center items-center">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}