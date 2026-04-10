import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "GIFT Inc.",
  description: "GIFT Inc. official website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
