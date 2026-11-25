import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "実家ガチャと空家のサバイバル。負動産・相続・管理不全空家等・行政代執行を疑似体験するシミュレーション。",
  applicationName: APP_NAME,
  icons: {
    icon: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-background font-sans text-[15px] text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
