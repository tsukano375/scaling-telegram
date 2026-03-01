import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "言語化トレーニング",
  description: "言語化力を毎日少しずつ鍛えるトレーニングアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        <main className="max-w-lg mx-auto min-h-screen bg-white shadow-sm pb-20">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
