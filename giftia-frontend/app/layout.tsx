import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ブラウザのタブの題名と説明文（Create Next App から Giftia 用に変更）
export const metadata: Metadata = {
  title: "Giftia｜誕生日プレゼントを探す",
  description: "相手の好きな雰囲気や使い道から、誕生日プレゼントを探せます。",
};

// lang="ja"：ページが日本語だとブラウザに伝える（フォント選び・翻訳の案内対策）
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (  
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
