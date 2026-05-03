import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumiforge — AI Compliance Platform",
  description: "Automate compliance across SOC2, GDPR, ISO 27001, HIPAA and PCI-DSS using multi-agent AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
