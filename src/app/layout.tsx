import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "GameForm Growth System",
  description:
    "Plataforma de growth tracking, validacao e maturidade para estudios e startups acompanhados pela Osten Games.",
};

import { SettingsProvider } from "@/components/providers/settings-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
