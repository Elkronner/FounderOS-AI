import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FounderOS AI",
  description:
    "Plataforma de growth tracking, validação e maturidade para estúdios e startups.",
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
